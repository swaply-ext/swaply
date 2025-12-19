package com.swaply.backend.shared.chat.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.shared.chat.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends CosmosRepository<ChatMessage, String> {

    // 1. Constante para el discriminador (Partition Key si usas Single Container pattern)
    String TYPE_CHAT_MESSAGE = "chatMessage";

    // 2. Derived Query Real
    // Spring Data genera automáticamente:
    // SELECT * FROM c WHERE c.roomId = @roomId AND c.type = @type
    Page<ChatMessage> findByRoomIdAndType(String roomId, String type, Pageable pageable);

    // 3. Método Default (Wrapper)
    // Permite llamar al repositorio solo con el roomId y la paginación,
    // inyectando automáticamente el tipo correcto.
    default Page<ChatMessage> findByRoomId(String roomId, Pageable pageable) {
        return findByRoomIdAndType(roomId, TYPE_CHAT_MESSAGE, pageable);
    }

}