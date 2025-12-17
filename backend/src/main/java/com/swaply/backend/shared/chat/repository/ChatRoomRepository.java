package com.swaply.backend.shared.chat.repository;

import com.azure.cosmos.models.PartitionKey;
import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.azure.spring.data.cosmos.repository.Query;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.chat.model.ChatMessage;
import com.swaply.backend.shared.chat.model.ChatRoom;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends CosmosRepository<ChatRoom, String> {


    String type = "room";
    PartitionKey ROOM_PARTITION_KEY = new PartitionKey(type);

    @Query("SELECT * FROM c WHERE c.partitionKey = 'room' AND ARRAY_CONTAINS(c.participants, @userId)")
    List<ChatRoom> findRoomsByUserId(@Param("userId") String userId);

    // 2. Obtener historial de mensajes de una sala (Paginado idealmente)
    @Query("SELECT * FROM c WHERE c.partitionKey = 'message' AND c.roomId = @roomId ORDER BY c.timestamp DESC")
    List<ChatRoom> findMessagesByChatId(@Param("roomId") String roomId);


    default boolean existsRoomById(String id) {
        return findById(id, ROOM_PARTITION_KEY).isPresent();
    }
      
    default void deleteRoomById(String id) {
        deleteById(id, ROOM_PARTITION_KEY);
    }

    default Optional<ChatRoom> findRoomById(String id) {
        return findById(id, ROOM_PARTITION_KEY);
    }

}