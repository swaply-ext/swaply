package com.swaply.backend.shared.token;

import com.swaply.backend.config.security.CustomUserDetailsService;
import com.swaply.backend.shared.chat.service.ChatService; // Necesario para validar sala
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import com.swaply.backend.shared.chat.service.ChatService;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;
    
    @Autowired
    private ChatService chatService; // Inyectamos servicio para validar salas

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && accessor.getCommand() != null) {
            
            // ----------------------------------------------------------------
            // FASE 1: AUTENTICACIÓN (Tu código original) -> Identidad Global
            // ----------------------------------------------------------------
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String authHeader = accessor.getFirstNativeHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.replace("Bearer ", "");
                    try {
                        String userId = jwtService.extractUserIdFromSessionToken(token);
                        if (userId != null) {
                            UserDetails userDetails = customUserDetailsService.loadUserByUsername(userId);
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities()
                            );
                            accessor.setUser(authToken); // "Ata" el usuario al socket
                        } else {
                            throw new IllegalArgumentException("Token inválido");
                        }
                    } catch (Exception e) {
                        throw new IllegalArgumentException("Fallo auth socket", e);
                    }
                } else {
                    throw new IllegalArgumentException("Token no proporcionado");
                }
            }

            // ----------------------------------------------------------------
            // FASE 2: AUTORIZACIÓN (La Optimización) -> Permisos de Sala
            // ----------------------------------------------------------------
            
            // CASO A: El usuario intenta entrar a una sala (SUBSCRIBE)
            // Aquí gastamos 1 consulta a la DB (necesaria para seguridad)
            else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                String roomId = extractRoomId(accessor.getDestination());
                Authentication user = (Authentication) accessor.getUser(); // Recuperamos el usuario de Fase 1

                if (roomId != null && user != null) {
                    // Validamos contra Cosmos DB una sola vez
                    boolean hasAccess = chatService.isUserInRoom(roomId, user.getName());
                    
                    if (!hasAccess) {
                        throw new AccessDeniedException("No perteneces a esta sala");
                    }
                    
                    // Si pasa, guardamos el "Sello de Aprobado" en RAM
                    addRoomPermissionToSession(accessor, roomId);
                }
            }

            // CASO B: El usuario intenta hablar (SEND)
            // Aquí gastamos 0 consultas a la DB (Validación en RAM)
            else if (StompCommand.SEND.equals(accessor.getCommand())) {
                String roomId = extractRoomId(accessor.getDestination());
                // Ojo: Si el destino no incluye ID, intenta sacarlo del header 'chat-id' si tu frontend lo envía
                
                if (roomId != null) {
                    // Verificamos solo la RAM
                    if (!hasPermissionInSession(accessor, roomId)) {
                        throw new AccessDeniedException("No tienes permiso o no te has suscrito a esta sala");
                    }
                }
            }
        }
        return message;
    }

    // --- Métodos Auxiliares ---
    
    private String extractRoomId(String destination) {
        // Lógica simple: asume rutas tipo /topic/room/123 o /app/chat.send/123
        if (destination == null) return null;
        int lastSlash = destination.lastIndexOf('/');
        return (lastSlash != -1) ? destination.substring(lastSlash + 1) : null;
    }

    @SuppressWarnings("unchecked")
    private void addRoomPermissionToSession(StompHeaderAccessor accessor, String roomId) {
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null) {
            // Usamos un Set para guardar IDs de salas permitidas en esta sesión
            Set<String> allowedRooms = (Set<String>) sessionAttributes.computeIfAbsent("ALLOWED_ROOMS", k -> new HashSet<>());
            allowedRooms.add(roomId);
        }
    }

    @SuppressWarnings("unchecked")
    private boolean hasPermissionInSession(StompHeaderAccessor accessor, String roomId) {
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null) {
            Set<String> allowedRooms = (Set<String>) sessionAttributes.get("ALLOWED_ROOMS");
            return allowedRooms != null && allowedRooms.contains(roomId);
        }
        return false;
    }
}