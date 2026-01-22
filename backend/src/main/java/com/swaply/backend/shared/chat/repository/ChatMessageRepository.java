package com.swaply.backend.shared.chat.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.shared.chat.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends CosmosRepository<ChatMessage, String> {

    String TYPE_CHAT_MESSAGE = "chatMessage";

    Page<ChatMessage> findByRoomIdAndType(String roomId, String type, Pageable pageable);


    default Page<ChatMessage> findByRoomId(String roomId, Pageable pageable) {
        return findByRoomIdAndType(roomId, TYPE_CHAT_MESSAGE, pageable);
    }

}