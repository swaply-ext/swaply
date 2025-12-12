package com.swaply.backend.shared.chat;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.GeneratedValue;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import org.springframework.data.annotation.Id;
import java.time.LocalDateTime;

@Container(containerName = "swaply-container")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue
    private String id;

    @PartitionKey
    private String type = "chat";

    // --- AGREGA ESTO ---
    private String roomId; 
    // -------------------

    private String senderId;
    private String content;
    private LocalDateTime timestamp;
}