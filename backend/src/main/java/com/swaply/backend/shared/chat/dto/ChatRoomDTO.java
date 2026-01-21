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
    
    // IDs de los usuarios para saber con quién se está hablando
    private List<String> participants;
    
    // Información del último mensaje para la lista de chats
    private String lastMessagePreview;
    @JsonFormat(shape = JsonFormat.Shape.STRING) // No hace falta patrón, el defecto es ISO con Z
    private Instant lastMessageTime;
    private String lastMessageSenderId;

    // Para mostrar el globito de notificaciones (ej: "tienes 3 mensajes")
    private Map<String, Integer> unreadCount;

    // Estado de la sala
    private boolean isActive; //MIRAR PARA QUE SIRVE
}