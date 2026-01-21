package com.swaply.backend.shared.chat.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
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

    private String roomId;
    private String content;
    private String senderId;
    @JsonFormat(shape = JsonFormat.Shape.STRING) // No hace falta patrón, el defecto es ISO con Z
    private Instant timestamp;


}