package com.swaply.backend.shared.chat.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HexFormat;
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

    public ChatHistoryResponse getChatHistoryByRoomId(String roomId, String userId, int pageSize,
            String continuationToken) {
        ChatRoom room = chatRoomRepository.findRoomById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("La sala no existe"));

        if (!room.getParticipants().contains(userId)) {
            throw new UserNotInThisRoomException("Este usuario no pertenece a esta sala");
        }

        Pageable pageRequest;
        if (continuationToken == null || continuationToken.isEmpty()) {
            pageRequest = new CosmosPageRequest(0, pageSize, null, Sort.by("timestamp").descending());
        } else {
            pageRequest = new CosmosPageRequest(0, pageSize, continuationToken, Sort.by("timestamp").descending());
        }

        Page<ChatMessage> page = chatRepository.findByRoomIdAndType(roomId, "message", pageRequest);

        List<ChatMessage> messages = new ArrayList<>(page.getContent());

        messages.forEach(msg -> {
            if (msg.getContent() != null) {
                msg.setContent(encryptionService.decrypt(msg.getContent()));
            }
        });

        Collections.reverse(messages);

        String nextToken = null;

        if (page.hasNext()) {
            Pageable nextPage = page.nextPageable();

            if (nextPage instanceof CosmosPageRequest) {
                nextToken = ((CosmosPageRequest) nextPage).getRequestContinuation();
            }
        }

        return new ChatHistoryResponse(messages, nextToken);
    }

    public Integer getTotalUnreadMessages(String userId) {
    List<ChatRoom> rooms = chatRoomRepository.findRoomsByUserId(userId);
    return rooms.stream()
                .map(r -> r.getUnreadCount().getOrDefault(userId, 0))
                .reduce(0, Integer::sum);
}


public SendChatRoomsDTO getChatRoomsByUserId(String userId) {
    List<ChatRoom> rooms = chatRoomRepository.findRoomsByUserId(userId);
    
    // 1. Extraer todos los IDs de los otros usuarios en una sola pasada
    List<String> otherUserIds = rooms.stream()
            .map(room -> room.getParticipants().stream()
                    .filter(id -> !id.equals(userId))
                    .findFirst()
                    .orElse(null))
            .filter(id -> id != null)
            .toList();

    // 2. ¡EL TRUCO! Ir a la base de datos UNA SOLA VEZ para traer a todos
    // (Tendrás que crear este método en tu UserService)
    Map<String, UserDTO> usersDataMap = userService.getUsersInfoByIds(otherUserIds);

    List<String> otherUsernames = new ArrayList<>();
    List<String> otherProfilePhotos = new ArrayList<>();

    // 3. Procesar las salas en memoria (súper rápido)
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
            // Leer del mapa en memoria, ¡NO de la base de datos!
            UserDTO otherUser = usersDataMap.get(otherUserId);

            if (otherUser != null && otherUser.getUsername() != null) {
                otherUsernames.add(otherUser.getUsername());
                otherProfilePhotos.add(otherUser.getProfilePhotoUrl()); 
            } else {
                otherUsernames.add("Usuario Desconocido");
                otherProfilePhotos.add("assets/default-image.jpg");
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

        String generatedId = generateSecureRoomId(user1, UserId2);
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

    public void readMessage(String roomId, String userId) {
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

    private String generateSecureRoomId(String idA, String idB) {
        try {
            String p1 = (idA.compareTo(idB) < 0) ? idA : idB;
            String p2 = (idA.compareTo(idB) < 0) ? idB : idA;
            String rawString = p1 + "###CHAT###" + p2;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(rawString.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }

            return hexString.toString();

        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error fatal: No se encontró el algoritmo SHA-256", e);
        }
    }

    public Optional<ChatRoom> findChatRoomByParticipants(String user1Id, String user2Id) {
        String generatedId = generateSecureRoomId(user1Id, user2Id);
        return chatRoomRepository.findRoomById(generatedId);
    }
}
