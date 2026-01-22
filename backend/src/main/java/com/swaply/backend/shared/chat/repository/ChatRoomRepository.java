package com.swaply.backend.shared.chat.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.azure.spring.data.cosmos.repository.Query;
import com.swaply.backend.shared.chat.model.ChatRoom;

import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends CosmosRepository<ChatRoom, String> {

    String TYPE_CHATROOM = "chatRoom";

    boolean existsByIdAndParticipantsContaining(String id, String username);

    List<ChatRoom> findByParticipantsContaining(String userId);

    Optional<ChatRoom> findById(String id);

    void deleteById(String id);

    default Optional<ChatRoom> findRoomById(String id) {
        return findById(id);
    }

    default boolean existsRoomById(String id) {
        return findById(id).isPresent();
    }

    default void deleteRoomById(String id) {
        deleteById(id);
    }

    @Query("SELECT * FROM c WHERE ARRAY_CONTAINS(c.participants, @userId)")
    List<ChatRoom> findRoomsByUserId(@Param("userId") String userId);

    default boolean isUserInRoom(String roomId, String username) {
        return existsByIdAndParticipantsContaining(roomId, username);
    }
}