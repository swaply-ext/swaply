package com.swaply.backend.shared.chat.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;

@Container(containerName = "swaply-container") // Nombre de la colección en Cosmos
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    private String id;

    @PartitionKey
    private String type = "message"; // Clave de partición para búsquedas rápidas

    private String content;
    private String senderId;
    private LocalDateTime timestamp;

    // Constructor útil para crear mensajes nuevos

}