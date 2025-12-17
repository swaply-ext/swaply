package com.swaply.backend.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registra el endpoint que usa ChatService.ts
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*") // Permite conexiones desde tu frontend (ajustar en producción)
                .withSockJS(); // Habilita SockJS como espera tu frontend
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefijo para mensajes que van AL servidor (ej: /app/chat)
        registry.setApplicationDestinationPrefixes("/app");
        
        // Prefijo para mensajes que van A LOS clientes (ej: /topic/messages)
        registry.enableSimpleBroker("/topic", "/queue");
    }
    
    // NOTA: Para validar el token JWT que envías en 'connectHeaders' desde el frontend,
    // deberías implementar 'configureClientInboundChannel' aquí con un ChannelInterceptor.
}
