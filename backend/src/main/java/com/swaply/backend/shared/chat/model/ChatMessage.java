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

@Container(containerName = "swaply-container") 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    private String id;

    @PartitionKey
    private String type = "message"; 

    private String roomId;
    private String content;
    private String senderId;
    @JsonFormat(shape = JsonFormat.Shape.STRING) 
    private Instant timestamp;


}