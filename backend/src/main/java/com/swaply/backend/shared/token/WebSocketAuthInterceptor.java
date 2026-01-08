package com.swaply.backend.shared.token;

import com.swaply.backend.config.security.CustomUserDetailsService;
import com.swaply.backend.shared.chat.service.ChatService;
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

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;
    
    @Autowired
    private ChatService chatService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && accessor.getCommand() != null) {
            
            // ----------------------------------------------------------------
            // FASE 1: AUTENTICACIÓN (CONNECT)
            // ----------------------------------------------------------------
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String authHeader = accessor.getFirstNativeHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7); // Mejor usar substring
                    try {
                        String username = jwtService.extractUserIdFromSessionToken(token); // O extractUserIdFromSessionToken según tu implementación
                        
                        if (username != null) {
                            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities()
                            );
                            accessor.setUser(authToken); 
                            // System.out.println("✅ WS Auth Exitosa para: " + username);
                        }
                    } catch (Exception e) {
                        // System.err.println("❌ Error token WS: " + e.getMessage());
                        return null; // Rechazar conexión silenciosamente o lanzar excepción
                    }
                }
            }

            // ----------------------------------------------------------------
            // FASE 2: AUTORIZACIÓN DE SUSCRIPCIÓN (SUBSCRIBE)
            // ----------------------------------------------------------------
            else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                String destination = accessor.getDestination();
                Authentication user = (Authentication) accessor.getUser();

                if (user == null) {
                    throw new AccessDeniedException("Usuario no autenticado");
                }
                
                String currentUsername = user.getName();

                // CASO A: Suscripción a una SALA DE CHAT (/topic/room/{roomId})
                if (destination != null && destination.startsWith("/topic/room/")) {
                    String roomId = destination.substring("/topic/room/".length());
                    
                    // Validar si el usuario pertenece a esa sala
                    boolean isMember = chatService.isUserInRoom(roomId, currentUsername);
                    if (!isMember) {
                        System.err.println("⛔ Acceso denegado a sala: " + roomId + " para usuario: " + currentUsername);
                        throw new AccessDeniedException("No perteneces a esta sala");
                    }
                }
                
                // CASO B: Suscripción a NOTIFICACIONES PRIVADAS (/topic/user/{userId}/updates)
                // ESTO ES LO QUE FALLABA ANTES
                else if (destination != null && destination.startsWith("/topic/user/")) {
                    // Formato esperado: /topic/user/{username}/updates
                    // Extraemos el username que está entre "/topic/user/" y "/updates"
                    String prefix = "/topic/user/";
                    String suffix = "/updates";
                    
                    if (destination.endsWith(suffix)) {
                        String targetUser = destination.substring(prefix.length(), destination.length() - suffix.length());
                        
                        // Validar que el usuario solo escuche SU PROPIO canal
                        if (!targetUser.equals(currentUsername)) {
                            System.err.println("⛔ Intento de espionaje. Usuario " + currentUsername + " intentó escuchar a " + targetUser);
                            throw new AccessDeniedException("No puedes escuchar notificaciones de otro usuario");
                        }
                    }
                }
            }
            
            // ----------------------------------------------------------------
            // FASE 3: ENVÍO DE MENSAJES (SEND)
            // ----------------------------------------------------------------
            else if (StompCommand.SEND.equals(accessor.getCommand())) {
                // Opcional: Validar que si envía a /app/chat.send/{roomId}, tenga permiso.
                // Por ahora lo dejamos pasar porque el Controller también valida.
                // Si quieres validarlo aquí, usa una lógica similar al CASO A de arriba.
            }
        }
        return message;
    }
}