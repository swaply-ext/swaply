package com.swaply.backend.shared.chat.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // Necesario para el Repository
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

// CAMBIO: Excepciones de Runtime para que no den error de compilación
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.chat.ChatMapper;
import com.swaply.backend.shared.chat.dto.ChatMessageDTO;
import com.swaply.backend.shared.chat.model.ChatMessage;
import com.swaply.backend.shared.chat.model.ChatRoom;
import com.swaply.backend.shared.chat.repository.ChatMessageRepository;
import com.swaply.backend.shared.chat.repository.ChatRoomRepository;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatRepository;
    @Autowired
    private ChatMapper chatMapper;
    @Autowired // IMPORTANTE: Faltaba este Autowired
    private ChatRoomRepository chatRoomRepository;

    public List<ChatMessage> getChatHistoryByRoomId(String roomId, String userId, int pageNumber) {

        // 1. Buscamos la sala.
        // El Repo debe devolver Optional<ChatRoom> para usar orElseThrow
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La sala no existe"));

        // 2. Validación de seguridad
        if (!room.getParticipants().contains(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver este chat");
        }

        // 3. Paginación
        Pageable pageRequest = PageRequest.of(pageNumber, 20, Sort.by("timestamp").descending());

        // 4. Ejecutar consulta
        // Asegúrate de pasar 'roomId', no 'userId' aquí
        Page<ChatMessage> page = chatRepository.findChatByIdPagealbe(roomId, pageRequest);

        return page.getContent();
    }

    public List<ChatRoom> getChatRoomsByUserId(String userId) {
        return chatRoomRepository.findRoomsByUserId(userId);
    }

    public ChatMessageDTO sendChatMessage(String userId, ChatMessageDTO dto) {

        // El Repo debe devolver Optional<ChatRoom> para usar orElseThrow
        ChatRoom room = chatRoomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La sala no existe"));

        // 2. Validación de seguridad
        if (!room.getParticipants().contains(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No tienes permiso para enviar mensajes a este chat");
        }
        ChatMessage newChatMessage = chatMapper.chatMessageDtoToEntity(dto);

        newChatMessage.setId(UUID.randomUUID().toString());

        ChatMessage savedMessage = chatRepository.save(newChatMessage);

        room.setLastMessagePreview(savedMessage.getContent());
        room.setLastMessageTime(savedMessage.getTimestamp());
        room.setLastMessageSenderId(savedMessage.getSenderId());

        chatRoomRepository.save(room);

        return chatMapper.chatMessageEntityToDTO(savedMessage);
    }

    private String generateRoomId(String u1, String u2) {
        return (u1.compareTo(u2) < 0) ? u1 + "_" + u2 : u2 + "_" + u1;
    }

    public ChatRoom createChatRoom(String user1, String user2) {
        String generatedId = generateRoomId(user1, user2);
        Optional<ChatRoom> existing = chatRoomRepository.findById(generatedId);
    if (existing.isPresent()) return existing.get();

    ChatRoom newRoom = ChatRoom.builder()
            .id(generatedId)
            .type("chatRoom")
            .participants(List.of(user1, user2))
            .createdAt(LocalDateTime.now())
            .isActive(true)
            .build();

    return chatRoomRepository.save(newRoom);

    }
}
