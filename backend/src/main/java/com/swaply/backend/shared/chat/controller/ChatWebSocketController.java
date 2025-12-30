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

    @MessageMapping("/chat.send/{roomId}")  //NAMEING
    public void processMessage(
            Principal principal,
            @DestinationVariable String roomId,
            @Payload ChatMessageDTO chatMessageDTO) {

        // 1. Obtener usuario (Esto es seguro, el Interceptor rechaza si es null)
        Authentication auth = (Authentication) principal;
        SecurityUser user = (SecurityUser) auth.getPrincipal();

        // 2. SEGURIDAD CRÍTICA: Sobrescribir el roomId del DTO
        // El interceptor validó que el usuario puede escribir en el {roomId} de la URL.
        // Debemos forzar que el mensaje se guarde con ESE id, ignorando lo que venga en el JSON.
        chatMessageDTO.setRoomId(roomId); 
        chatMessageDTO.setSenderId(user.getUsername()); // Asegurar el remitente también

    // 3. Guardar (Sin validar permisos de nuevo)
    // El servicio solo se encarga de la lógica de negocio y persistencia.
    System.out.println("[ChatWebSocketController] processMessage from=" + user.getUsername() + " roomId=" + roomId + " payload=" + chatMessageDTO);
    ChatMessageDTO savedMessage = chatService.sendChatMessage(chatMessageDTO);
    System.out.println("[ChatWebSocketController] savedMessage id=" + (savedMessage==null?"null":savedMessage.getId()));

    // 4. Notificar a la sala
    messagingTemplate.convertAndSend("/topic/room/" + roomId, savedMessage);
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleException(Throwable exception) {
        return "Error en el chat: " + exception.getMessage();
    }
}