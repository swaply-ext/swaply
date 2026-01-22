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
            
            // Autenticación inicial de la conexión
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String authHeader = accessor.getFirstNativeHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    try {
                        String username = jwtService.extractUserIdFromSessionToken(token);
                        
                        if (username != null) {
                            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities()
                            );
                            accessor.setUser(authToken); 
                        }
                    } catch (Exception e) {
                        return null; 
                    }
                }
            }

            // Validación de permisos de suscripción
            else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                String destination = accessor.getDestination();
                Authentication user = (Authentication) accessor.getUser();

                if (user == null) {
                    throw new AccessDeniedException("Usuario no autenticado");
                }
                
                String currentUsername = user.getName();

                // Validación de acceso a salas de chat
                if (destination != null && destination.startsWith("/topic/room/")) {
                    String roomId = destination.substring("/topic/room/".length());
                    
                    boolean isMember = chatService.isUserInRoom(roomId, currentUsername);
                    if (!isMember) {
                        throw new AccessDeniedException("No perteneces a esta sala");
                    }
                }
                
                // Validación de acceso a notificaciones privadas
                else if (destination != null && destination.startsWith("/topic/user/")) {
                    String prefix = "/topic/user/";
                    String suffix = "/updates";
                    
                    if (destination.endsWith(suffix)) {
                        String targetUser = destination.substring(prefix.length(), destination.length() - suffix.length());
                        
                        if (!targetUser.equals(currentUsername)) {
                            throw new AccessDeniedException("No puedes escuchar notificaciones de otro usuario");
                        }
                    }
                }
            }
            
            else if (StompCommand.SEND.equals(accessor.getCommand())) {
                // El controlador valida los permisos de envío
            }
        }
        return message;
    }
}