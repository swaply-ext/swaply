package com.swaply.backend.shared.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import com.swaply.backend.shared.chat.model.ChatRoom;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendChatRoomsDTO {
    
    private String username;
    
    private List<ChatRoom> chatRooms;
}