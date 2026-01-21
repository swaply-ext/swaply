package com.swaply.backend.shared.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomDTO {
    
    private String id;
    
    private List<String> participants;
    
    private String lastMessagePreview;
    @JsonFormat(shape = JsonFormat.Shape.STRING) 
    private Instant lastMessageTime;
    private String lastMessageSenderId;


    private Map<String, Integer> unreadCount;

    private boolean isActive; 
}