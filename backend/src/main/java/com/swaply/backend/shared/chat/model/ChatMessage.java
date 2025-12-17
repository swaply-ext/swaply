package com.swaply.backend.shared.chat.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import org.springframework.data.annotation.Id;

@Container(containerName = "chat_messages") // Nombre de la colección en Cosmos
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    private String id;

    @PartitionKey
    private String type = "room"; // Clave de partición para búsquedas rápidas

    private String content;
    private String senderId;
    private String timestamp;

    // Constructor útil para crear mensajes nuevos

}