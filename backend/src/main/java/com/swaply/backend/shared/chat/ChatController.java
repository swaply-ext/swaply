package com.swaply.backend.shared.chat;

import java.time.LocalDateTime; // 1. Import necesario para las fechas

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import com.swaply.backend.shared.chat.ChatMessageRequest;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRepository chatRepository;

    // 2. CONSTRUCTOR INJECTION (Esto es lo que faltaba para quitar el rojo de las
    // variables)
    @Autowired
    public ChatController(SimpMessagingTemplate messagingTemplate, ChatRepository chatRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatRepository = chatRepository;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageRequest request) { // Usamos el DTO aquí

        // 1. Mapeo: Pasamos datos del DTO a la Entidad
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setRoomId(request.getRoomId());
        chatMessage.setSenderId(request.getSenderId());
        chatMessage.setContent(request.getContent());

        // 2. Datos de Sistema: Los pone el servidor, no el usuario
        chatMessage.setTimestamp(LocalDateTime.now());
        // El campo 'type' ya se inicializa solo como "chat" en la clase
        // El campo 'id' se genera automáticamente al guardar en CosmosDB

        // 3. Guardar en Base de Datos
        ChatMessage savedMessage = chatRepository.save(chatMessage);

        // 4. Enviar a la sala específica
        messagingTemplate.convertAndSend("/topic/room/" + request.getRoomId(), savedMessage);
    }
}