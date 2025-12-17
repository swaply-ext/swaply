package com.swaply.backend.shared.token; // O donde prefieras guardarlo

import com.swaply.backend.config.security.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // Solo validamos cuando el usuario intenta conectar el socket (CONNECT)
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            
            // 1. Obtener el token del header nativo del mensaje STOMP
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.replace("Bearer ", "");

                try {
                    // 2. Usar TU lógica existente para extraer el ID
                    String userId = jwtService.extractUserIdFromSessionToken(token);

                    if (userId != null) {
                        // 3. Cargar el usuario
                        UserDetails userDetails = customUserDetailsService.loadUserByUsername(userId);

                        // 4. Crear la autenticación
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                        // 5. IMPORTANTE: Inyectar la autenticación en el contexto del WebSocket
                        accessor.setUser(authToken);
                    } else {
                        // Si el token no tiene ID válido, rechazamos
                        throw new IllegalArgumentException("Token inválido: ID de usuario no encontrado");
                    }

                } catch (Exception e) {
                    // En WebSockets, si falla la auth, debemos lanzar excepción para cortar la conexión
                    throw new IllegalArgumentException("Fallo en autenticación WebSocket", e);
                }
            } else {
                // Si no hay token, no dejamos conectar
                // Nota: A veces se permite conexión anónima, si no quieres eso, lanza excepción aquí.
                 throw new IllegalArgumentException("Token de autorización no proporcionado");
            }
        }
        return message;
    }
}