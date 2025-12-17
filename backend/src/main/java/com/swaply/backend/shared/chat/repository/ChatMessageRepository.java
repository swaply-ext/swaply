package com.swaply.backend.shared.chat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.azure.cosmos.models.PartitionKey;
import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.shared.chat.model.ChatMessage;

@Repository
public interface ChatMessageRepository extends CosmosRepository<ChatMessage, Long> {
    String type = "chat";
    PartitionKey CHAT_PARTITION_KEY = new PartitionKey(type);

    // Este método devuelve una "Page" (Página) en lugar de una "List" directa.
    // "FindByRoomId" asume que tu entidad ChatMessage tiene un campo "roomId".
    Page<ChatMessage> findChatByIdPagealbe(String id, Pageable pageable);
}