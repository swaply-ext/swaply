package com.swaply.backend.shared.chat;

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
        // "ws" es la ruta para conectar desde Angular
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Ojo con CORS en producción
                .withSockJS(); // Fallback si el navegador no soporta WS
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefijo para mensajes que van DEL servidor AL cliente
        registry.enableSimpleBroker("/topic", "/queue");
        // Prefijo para mensajes que van DEL cliente AL servidor
        registry.setApplicationDestinationPrefixes("/app");
    }
}