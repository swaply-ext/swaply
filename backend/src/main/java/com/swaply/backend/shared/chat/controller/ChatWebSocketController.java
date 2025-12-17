package com.swaply.backend.shared.chat.controller;

import com.swaply.backend.shared.chat.dto.ChatMessageDTO;
import com.swaply.backend.shared.chat.service.ChatService;
import com.swaply.backend.config.security.SecurityUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * El cliente envía mensajes a: /app/chat.send/{roomId}
     */
    @MessageMapping("/chat.send/{roomId}")
    public void processMessage(
            @AuthenticationPrincipal SecurityUser user,
            @DestinationVariable String roomId,
            @Payload ChatMessageDTO chatMessageDTO) {

        // 1. Aseguramos que el roomId del DTO sea el de la URL
        chatMessageDTO.setRoomId(roomId);

        // 2. Guardamos en Cosmos DB a través del service (incluye validación de seguridad)
        ChatMessageDTO savedMessage = chatService.sendChatMessage(user.getUsername(), chatMessageDTO);

        // 3. Notificamos a los suscriptores de esa sala en tiempo real
        // Los clientes deben estar suscritos a: /topic/room/{roomId}
        messagingTemplate.convertAndSend("/topic/room/" + roomId, savedMessage);
    }
}