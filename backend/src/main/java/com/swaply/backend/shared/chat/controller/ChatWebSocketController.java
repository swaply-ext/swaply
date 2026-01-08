package com.swaply.backend.shared.chat.controller;

import com.swaply.backend.shared.chat.dto.ChatMessageDTO;
import com.swaply.backend.shared.chat.service.ChatService;
import com.swaply.backend.config.security.SecurityUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
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
            Principal principal,
            @DestinationVariable String roomId,
            @Payload ChatMessageDTO chatMessageDTO) {

        Authentication auth = (Authentication) principal;
        SecurityUser user = (SecurityUser) auth.getPrincipal();

        // Seguridad: Forzar roomId de la URL y remitente autenticado para evitar suplantación
        chatMessageDTO.setRoomId(roomId); 
        chatMessageDTO.setSenderId(user.getUsername()); 

        ChatMessageDTO savedMessage = chatService.sendChatMessage(chatMessageDTO);

        // Notificar a todos los suscritos a la sala
        messagingTemplate.convertAndSend("/topic/room/" + roomId, savedMessage);
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleException(Throwable exception) {
        return "Error en el chat: " + exception.getMessage();
    }
}