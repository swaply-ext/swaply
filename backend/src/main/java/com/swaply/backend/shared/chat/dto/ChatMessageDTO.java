package com.swaply.backend.shared.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

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
    @JsonFormat(shape = JsonFormat.Shape.STRING) // No hace falta patrón, el defecto es ISO con Z
    private Instant timestamp;
}