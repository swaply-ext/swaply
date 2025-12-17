package com.swaply.backend.shared.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {
    private String id;
    private String roomId;
    private String senderId;
    private String content;
    private int pageNumber;
    private LocalDateTime timestamp;
}