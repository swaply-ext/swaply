package com.swaply.backend.shared.chat.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.shared.chat.model.ChatRoom;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends CosmosRepository<ChatRoom, String> {

    // Definimos la constante para usarla en los métodos default
    String TYPE_CHATROOM = "chatRoom";

    // -----------------------------------------------------------------
    // 1. DERIVED QUERIES (Consultas derivadas reales)
    // -----------------------------------------------------------------

    // SQL: SELECT VALUE (COUNT(1) > 0) FROM c WHERE c.id = @id AND ARRAY_CONTAINS(c.participants, @username)
    boolean existsByIdAndParticipantsContaining(String id, String username);

    // SQL: SELECT * FROM c WHERE c.type = 'chatRoom' AND ARRAY_CONTAINS(c.participants, @userId)
    // Usamos 'Type' para asegurar el hit a la Partition Key correcta
    List<ChatRoom> findByTypeAndParticipantsContaining(String type, String userId);

    // SQL: SELECT * FROM c WHERE c.id = @id AND c.type = @type
    Optional<ChatRoom> findByIdAndType(String id, String type);

    // SQL: DELETE FROM c WHERE c.id = @id AND c.type = @type
    void deleteByIdAndType(String id, String type);

    // -----------------------------------------------------------------
    // 2. MÉTODOS DEFAULT (Wrappers para mantener tus nombres originales)
    // -----------------------------------------------------------------

    // Recuperar sala por ID (Inyectando el tipo automáticamente)
    default Optional<ChatRoom> findRoomById(String id) {
        return findByIdAndType(id, TYPE_CHATROOM);
    }

    // Verificar si existe la sala (Usando findByIdAndType es seguro, o podrías crear existsByIdAndType)
    default boolean existsRoomById(String id) {
        return findByIdAndType(id, TYPE_CHATROOM).isPresent();
    }

    // Borrar sala por ID
    default void deleteRoomById(String id) {
        deleteByIdAndType(id, TYPE_CHATROOM);
    }
    
    // Buscar salas por User ID
    default List<ChatRoom> findRoomsByUserId(String userId) {
        return findByTypeAndParticipantsContaining(TYPE_CHATROOM, userId);
    }
    
    // Verificar usuario en sala
    default boolean isUserInRoom(String roomId, String username) {
        return existsByIdAndParticipantsContaining(roomId, username);
    }
}