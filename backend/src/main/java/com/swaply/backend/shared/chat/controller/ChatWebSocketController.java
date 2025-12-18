package com.swaply.backend.shared.chat.controller;

import com.swaply.backend.shared.chat.dto.ChatMessageDTO;
import com.swaply.backend.shared.chat.service.ChatService;
import com.swaply.backend.config.security.SecurityUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import java.security.Principal;

@Controller
public class ChatWebSocketController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send/{roomId}")
    public void processMessage(
            // CAMBIO: Usamos Principal para evitar el error de conversión JSON
            Principal principal,
            @DestinationVariable String roomId,
            @Payload ChatMessageDTO chatMessageDTO) {

        // Recuperamos el usuario de forma segura desde la sesión
        Authentication auth = (Authentication) principal;
        SecurityUser user = (SecurityUser) auth.getPrincipal();

        chatMessageDTO.setRoomId(roomId);

        // Guardar y notificar
        ChatMessageDTO savedMessage = chatService.sendChatMessage(user.getUsername(), chatMessageDTO);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, savedMessage);
    }
}