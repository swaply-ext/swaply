package com.swaply.backend.shared.chat.controller;

import com.swaply.backend.shared.chat.dto.ChatMessageDTO;
import com.swaply.backend.shared.chat.model.ChatMessage;
import com.swaply.backend.shared.chat.model.ChatRoom;
import com.swaply.backend.shared.chat.service.ChatService;
import com.swaply.backend.config.security.SecurityUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    // Obtener todas las salas del usuario logueado
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoom>> getMyRooms(@AuthenticationPrincipal SecurityUser user) {
        return ResponseEntity.ok(chatService.getChatRoomsByUserId(user.getUsername()));
    }

    // Obtener historial de una sala específica
    @GetMapping("/history/{roomId}")
    public ResponseEntity<List<ChatMessage>> getHistory(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable String roomId) {
        return ResponseEntity.ok(chatService.getChatHistoryByRoomId(roomId, user.getUsername()));
    }

    // Crear una sala (ej: cuando un usuario pulsa "Contactar" en un producto)
    @PostMapping("/rooms/create/{targetUserId}")
    public ResponseEntity<ChatRoom> createRoom(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable String targetUserId) {
        return ResponseEntity.ok(chatService.createChatRoom(user.getUsername(), targetUserId));
    }
}