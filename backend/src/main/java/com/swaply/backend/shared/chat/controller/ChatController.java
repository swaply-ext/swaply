package com.swaply.backend.shared.chat.controller;

import com.swaply.backend.shared.chat.dto.SendChatRoomsDTO;
import com.swaply.backend.shared.chat.model.ChatHistoryResponse;
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
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/rooms")
    public ResponseEntity<SendChatRoomsDTO> getMyRooms(@AuthenticationPrincipal SecurityUser user) {
        System.out
                .println("[ChatController] getMyRooms called for user=" + (user == null ? "null" : user.getUsername()));
        if (user == null) {
            System.out.println("[ChatController] Unauthorized request to /rooms - missing principal");
            return ResponseEntity.status(401).build();
        }
        try {
            return ResponseEntity.ok(chatService.getChatRoomsByUserId(user.getUsername()));
        } catch (Exception e) {
            System.out.println("[ChatController] error in getMyRooms: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/history/{roomId}")
    public ResponseEntity<ChatHistoryResponse> getHistory(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable String roomId,
            @RequestParam(required = false) String continuationToken, // <--- Ahora recibimos String token
            @RequestParam(defaultValue = "20") int size) {

        if (user == null)
            return ResponseEntity.status(401).build();
        try {
            chatService.readMessage(roomId, user.getUsername());
            return ResponseEntity.ok(chatService.getChatHistoryByRoomId(roomId, user.getUsername(), size, continuationToken));
        } catch (Exception e) {
            System.out.println("[ChatController] error in getHistory: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/rooms/create/{targetUserId}")
    public ResponseEntity<ChatRoom> createRoom(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable String targetUserId) {
        if (user == null)
            return ResponseEntity.status(401).build();
        try {
            ChatRoom room = chatService.createChatRoom(user.getUsername(), targetUserId);
            System.out.println("[ChatController] created/fetched room id=" + room.getId());
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            System.out.println("[ChatController] error creating room: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/messageReaded/{roomId}")
    public ResponseEntity<Boolean> readedMessage(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable String roomId) {
        if (user == null)
            return ResponseEntity.status(401).build();
        try {
            chatService.readMessage(roomId, user.getUsername());
            return ResponseEntity.ok(true);
        } catch (Exception e) {
            System.out.println("[ChatController] error in readedMessage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

}