package com.swaply.backend.shared.chat;

import java.time.LocalDateTime; // 1. Import necesario para las fechas

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import com.swaply.backend.application.account.dto.PersonalInfoDTO;
import com.swaply.backend.config.security.SecurityUser;
import com.swaply.backend.shared.chat.model.ChatMessage;
import com.swaply.backend.shared.chat.repository.ChatRoomRepository;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRoomRepository chatRepository;

    // 2. CONSTRUCTOR INJECTION (Esto es lo que faltaba para quitar el rojo de las
    // variables)
    @Autowired
    public ChatController(SimpMessagingTemplate messagingTemplate, ChatRoomRepository chatRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatRepository = chatRepository;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageRequest request) { // Usamos el DTO aquí
        
    }


    public ResponseEntity<Boolean> updatePersonalInfo(
            @AuthenticationPrincipal SecurityUser SecurityUser,
            @RequestBody PersonalInfoDTO dto) {
        service.UpdatePersonalInfo(SecurityUser.getUsername(), dto);
}