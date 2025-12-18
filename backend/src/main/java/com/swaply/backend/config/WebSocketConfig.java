package com.swaply.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.swaply.backend.shared.token.WebSocketAuthInterceptor;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private WebSocketAuthInterceptor webSocketAuthInterceptor;

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

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(webSocketAuthInterceptor);
    }
}
