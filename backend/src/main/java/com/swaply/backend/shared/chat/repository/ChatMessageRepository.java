package com.swaply.backend.shared.chat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.azure.cosmos.models.PartitionKey;
import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.azure.spring.data.cosmos.repository.Query;
import com.swaply.backend.shared.chat.model.ChatMessage;

@Repository
public interface ChatMessageRepository extends CosmosRepository<ChatMessage, String> {
    String type = "message";
    PartitionKey CHAT_PARTITION_KEY = new PartitionKey(type);

    // Este método devuelve una "Page" (Página) en lugar de una "List" directa.
    @Query("SELECT * FROM c WHERE c.roomId = @roomId AND c.type = 'message'")
    Page<ChatMessage> findByRoomId(@Param("roomId") String roomId, Pageable pageable);
}