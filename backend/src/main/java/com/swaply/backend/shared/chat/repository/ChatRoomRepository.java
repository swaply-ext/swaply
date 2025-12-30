package com.swaply.backend.shared.chat.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.shared.chat.model.ChatRoom;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ChatRoom entities stored in Cosmos DB.
 *
 * Important: avoid using com.azure.cosmos.models.PartitionKey in method signatures
 * because Spring Data Cosmos may try to serialize it into SQL parameters which
 * can trigger Jackson serialization errors. Use String-based params instead.
 */
@Repository
public interface ChatRoomRepository extends CosmosRepository<ChatRoom, String> {

    // Partition type value used in documents
    String TYPE_CHATROOM = "chatRoom";

    // Derived query methods (use only String parameters)
    boolean existsByIdAndParticipantsContaining(String id, String username);

    List<ChatRoom> findByParticipantsContaining(String userId);

    Optional<ChatRoom> findById(String id);

    void deleteById(String id);

    // Convenience default wrappers
    default Optional<ChatRoom> findRoomById(String id) {
        return findById(id);
    }

    default boolean existsRoomById(String id) {
        return findById(id).isPresent();
    }

    default void deleteRoomById(String id) {
        deleteById(id);
    }

    default List<ChatRoom> findRoomsByUserId(String userId) {
        return findByParticipantsContaining(userId);
    }

    default boolean isUserInRoom(String roomId, String username) {
        return existsByIdAndParticipantsContaining(roomId, username);
    }
}