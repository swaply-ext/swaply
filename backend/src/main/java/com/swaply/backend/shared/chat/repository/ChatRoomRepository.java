package com.swaply.backend.shared.chat.repository;

import com.azure.cosmos.models.PartitionKey;
import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.azure.spring.data.cosmos.repository.Query;
import com.swaply.backend.shared.chat.model.ChatRoom;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends CosmosRepository<ChatRoom, String> {

    // Debe coincidir con el valor en ChatRoom.java
    String type = "chatRoom";
    PartitionKey ROOM_PARTITION_KEY = new PartitionKey(type);

    @Query("SELECT * FROM c WHERE c.type = 'chatRoom' AND ARRAY_CONTAINS(c.participants, @userId)")
    List<ChatRoom> findRoomsByUserId(@Param("userId") String userId);


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