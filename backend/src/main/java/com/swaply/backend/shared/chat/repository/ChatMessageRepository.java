package com.swaply.backend.shared.chat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.azure.spring.data.cosmos.repository.Query;
import com.swaply.backend.shared.chat.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


@Repository
public interface ChatMessageRepository extends CosmosRepository<ChatMessage, String> {


    Page<ChatMessage> findByRoomIdAndType(String roomId, String type, Pageable pageable);
    
}