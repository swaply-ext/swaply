package com.swaply.backend.shared.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Este DTO representa lo que el Frontend envía al Backend
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {

    // El ID de la sala es vital para saber a dónde enviar el mensaje
    private String roomId; 
    
    // Quién envía el mensaje
    private String senderId;
    
    // El texto del mensaje
    private String content;
}