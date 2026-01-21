package com.swaply.backend.shared.chat.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Container(containerName = "swaply-container")
public class ChatRoom {

    @Id
    private String id; 

    @PartitionKey
    private String type = "chatRoom"; 

    private List<String> participants;

    private String lastMessagePreview;
    @JsonFormat(shape = JsonFormat.Shape.STRING) 
    private Instant lastMessageTime;
    private String lastMessageSenderId;

    private Map<String, Integer> unreadCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private boolean isActive = true; 
}