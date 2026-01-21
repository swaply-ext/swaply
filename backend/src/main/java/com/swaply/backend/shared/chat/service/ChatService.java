package com.swaply.backend.shared.chat.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
// Imports estándar de Spring Data
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;

// Imports de Azure Cosmos
import com.azure.spring.data.cosmos.core.query.CosmosPageRequest;
import com.azure.cosmos.models.CosmosPatchOperations;
import com.azure.cosmos.models.PartitionKey;
import com.azure.spring.data.cosmos.core.CosmosTemplate;

import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.UserCRUD.exception.UserNotFoundException;
import com.swaply.backend.shared.chat.ChatMapper;
import com.swaply.backend.shared.chat.dto.ChatMessageDTO;
import com.swaply.backend.shared.chat.dto.SendChatRoomsDTO;
import com.swaply.backend.shared.chat.repository.ChatRoomRepository;
import com.swaply.backend.shared.chat.exception.RoomNotFoundException;
import com.swaply.backend.shared.chat.exception.UserNotInThisRoomException;
import com.swaply.backend.shared.chat.model.ChatHistoryResponse;
import com.swaply.backend.shared.chat.model.ChatMessage;
import com.swaply.backend.shared.chat.model.ChatRoom;
import com.swaply.backend.shared.chat.repository.ChatMessageRepository;

@Service
public class ChatService {

    @Autowired
    private EncryptionService encryptionService;
    @Autowired
    private ChatMessageRepository chatRepository;
    @Autowired
    private CosmosTemplate cosmosTemplate;
    @Autowired
    private UserService userService;
    @Autowired
    private ChatMapper chatMapper;
    @Autowired
    private ChatRoomRepository chatRoomRepository;
    @Autowired
    @Lazy
    private SimpMessagingTemplate messagingTemplate;

    public ChatHistoryResponse getChatHistoryByRoomId(String roomId, String userId, int pageSize, String continuationToken) {
        // 1. Validaciones
        ChatRoom room = chatRoomRepository.findRoomById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("La sala no existe"));

        if (!room.getParticipants().contains(userId)) {
            throw new UserNotInThisRoomException("Este usuario no pertenece a esta sala");
        }

        // 2. Configurar Paginación Cosmos
        Pageable pageRequest;
        if (continuationToken == null || continuationToken.isEmpty()) {
            pageRequest = new CosmosPageRequest(0, pageSize, null, Sort.by("timestamp").descending());
        } else {
            pageRequest = new CosmosPageRequest(0, pageSize, continuationToken, Sort.by("timestamp").descending());
        }

        // 3. Ejecutar Query
        Page<ChatMessage> page = chatRepository.findByRoomIdAndType(roomId, "message", pageRequest);

        // 4. Procesar lista (Mutable)
        List<ChatMessage> messages = new ArrayList<>(page.getContent());
        
        // Desencriptar
        messages.forEach(msg -> {
            if (msg.getContent() != null) {
                msg.setContent(encryptionService.decrypt(msg.getContent()));
            }
        });

        // Invertir orden para visualización (A->Z)
        Collections.reverse(messages);

        // 5. Obtener Token de Continuación (CORREGIDO)
        String nextToken = null;
        
        // Verificamos si existe una página siguiente
        if (page.hasNext()) {
            // Obtenemos la definición de la siguiente página
            Pageable nextPage = page.nextPageable();
            
            // Si la definición es de tipo CosmosPageRequest, extraemos el token de ahí
            if (nextPage instanceof CosmosPageRequest) {
                nextToken = ((CosmosPageRequest) nextPage).getRequestContinuation();
            }
        }

        return new ChatHistoryResponse(messages, nextToken);
    }


    public SendChatRoomsDTO getChatRoomsByUserId(String userId) {
        List<ChatRoom> rooms = chatRoomRepository.findRoomsByUserId(userId);
        List<String> otherUsernames = new ArrayList<>();
        List<String> otherProfilePhotos = new ArrayList<>();

        for (ChatRoom room : rooms) {

            if (room.getLastMessagePreview() != null) {
                String decryptedPreview = encryptionService.decrypt(room.getLastMessagePreview());
                room.setLastMessagePreview(decryptedPreview);
            }

            String otherUserId = room.getParticipants().stream()
                    .filter(id -> !id.equals(userId))
                    .findFirst()
                    .orElse(null);

            if (otherUserId != null) {
                String otherUsername = userService.getUsernameById(otherUserId);
                String otherProfilePhoto = userService.getProfilePhotoById(otherUserId);

                if (otherUsername != null) {
                    otherUsernames.add(otherUsername);
                    otherProfilePhotos.add(otherProfilePhoto);
                } else {
                    otherUsernames.add("Usuario Desconocido");
                }
            }
        }

        return SendChatRoomsDTO.builder()
                .username(otherUsernames)
                .chatRooms(rooms)
                .partnerAvatar(otherProfilePhotos)
                .build();
    }

    @Async
    public void updateRoomMetadataAsync(String roomId, ChatMessage message) {
        ChatRoom room = chatRoomRepository.findRoomById(roomId).orElse(null);

        if (room == null)
            return;

        CosmosPatchOperations patchOps = CosmosPatchOperations.create()
                .set("/lastMessagePreview", message.getContent())
                .set("/lastMessageTime", message.getTimestamp())
                .set("/lastMessageSenderId", message.getSenderId());

        String senderId = message.getSenderId();

        if (room.getParticipants() != null) {
            for (String participantId : room.getParticipants()) {
                if (!participantId.equals(senderId)) {
                    patchOps.increment("/unreadCount/" + participantId, 1);
                }
            }
        }

        try {
            cosmosTemplate.patch(
                    roomId,
                    new PartitionKey(ChatRoomRepository.TYPE_CHATROOM),
                    ChatRoom.class,
                    patchOps);
        } catch (Exception e) {
            return;
        }

        if (room.getParticipants() != null) {
            for (String participantId : room.getParticipants()) {
                notifyUserListUpdate(participantId);
            }
        }
    }

    public ChatMessageDTO sendChatMessage(ChatMessageDTO dto) {

        String rawContent = dto.getContent();

        ChatMessage newChatMessage = chatMapper.chatMessageDtoToEntity(dto);
        newChatMessage.setId(UUID.randomUUID().toString());
        newChatMessage.setType("message");
        newChatMessage.setTimestamp(Instant.now());

        String encryptedContent = encryptionService.encrypt(rawContent);
        newChatMessage.setContent(encryptedContent);

        ChatMessage savedMessage = chatRepository.save(newChatMessage);

        updateRoomMetadataAsync(savedMessage.getRoomId(), savedMessage);

        ChatMessageDTO responseDto = chatMapper.chatMessageEntityToDTO(savedMessage);

        responseDto.setContent(rawContent);

        messagingTemplate.convertAndSend("/topic/room/" + savedMessage.getRoomId(), responseDto);

        return responseDto;
    }

    public ChatRoom createChatRoom(String user1, String user2) {
        if (user1 == null)
            throw new UserNotFoundException("Usuario remitente nulo");

        UserDTO user = userService.getUserByUsername(user2);
        if (user == null) {
            throw new UserNotFoundException("El usuario objetivo no existe: " + user2);
        }

        String UserId2 = user.getId();

        String generatedId = (user1.compareTo(UserId2) < 0) ? user1 + "_" + UserId2 : UserId2 + "_" + user1;

        Optional<ChatRoom> existing = chatRoomRepository.findRoomById(generatedId);
        if (existing.isPresent())
            return existing.get();

        Map<String, Integer> initialUnreadMap = new HashMap<>();
        initialUnreadMap.put(user1, 0);
        initialUnreadMap.put(UserId2, 0);

        ChatRoom newRoom = ChatRoom.builder()
                .id(generatedId)
                .type("chatRoom")
                .participants(List.of(user1, UserId2))
                .unreadCount(initialUnreadMap)
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .build();

        ChatRoom saved = chatRoomRepository.save(newRoom);

        notifyUserListUpdate(user1);
        notifyUserListUpdate(UserId2);
        return saved;
    }

    public void readedMessage(String roomId, String userId) {
        if (!chatRoomRepository.existsById(roomId)) {
            throw new RoomNotFoundException("La sala no existe");
        }

        CosmosPatchOperations patchOps = CosmosPatchOperations.create()
                .set("/unreadCount/" + userId, 0);

        cosmosTemplate.patch(
                roomId,
                new PartitionKey(ChatRoomRepository.TYPE_CHATROOM),
                ChatRoom.class,
                patchOps);
    }

    public boolean isUserInRoom(String roomId, String username) {
        Optional<ChatRoom> chatRoomOpt = chatRoomRepository.findById(roomId);

        if (chatRoomOpt.isEmpty())
            return false;

        ChatRoom room = chatRoomOpt.get();

        if (room.getParticipants() != null) {
            return room.getParticipants().contains(username);
        }

        return false;
    }

    private void notifyUserListUpdate(String userId) {
        String destination = "/topic/user/" + userId + "/updates";
        try {
            messagingTemplate.convertAndSend(destination, "REFRESH_LIST");
        } catch (Exception e) {
        }
    }
}