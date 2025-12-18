package com.swaply.backend.shared.chat.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;

import com.azure.cosmos.models.CosmosPatchOperations;
import com.azure.cosmos.models.PartitionKey;
import com.azure.spring.data.cosmos.core.CosmosTemplate;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.chat.ChatMapper;
import com.swaply.backend.shared.chat.dto.ChatMessageDTO;
import com.swaply.backend.shared.chat.dto.SendChatRoomsDTO;
import com.swaply.backend.shared.chat.model.ChatMessage;
import com.swaply.backend.shared.chat.model.ChatRoom;
import com.swaply.backend.shared.chat.repository.ChatMessageRepository;
import com.swaply.backend.shared.chat.repository.ChatRoomRepository;

@Service
public class ChatService {

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

    // --- LEER HISTORIAL ---
    public List<ChatMessage> getChatHistoryByRoomId(String roomId, String userId, int pageNumber) {

        ChatRoom room = chatRoomRepository.findRoomById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La sala no existe"));

        if (!room.getParticipants().contains(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso");
        }

        // Paginación correcta
        Pageable pageRequest = PageRequest.of(pageNumber, 20, Sort.by("timestamp").descending());

        // Buscamos explícitamente en la partición 'message'
        Page<ChatMessage> page = chatRepository.findByRoomIdAndType(roomId, "message", pageRequest);

        return page.getContent();
    }

    public SendChatRoomsDTO getChatRoomsByUserId(String userId) {
        // 1. Obtenemos todas las salas de una sola vez
        List<ChatRoom> rooms = chatRoomRepository.findRoomsByUserId(userId);

        // 2. Creamos una lista para guardar los nombres (Usernames)
        List<String> otherUsernames = new ArrayList<>();

        // 3. Recorremos las salas
        for (ChatRoom room : rooms) {
            // Buscamos el ID del otro participante
            String otherUserId = room.getParticipants().stream()
                    .filter(id -> !id.equals(userId))
                    .findFirst()
                    .orElse(null);

            if (otherUserId != null) {

                // 1. Buscamos al usuario completo en la base de datos usando su ID
                UserDTO otherUserDto = userService.getUserByID(otherUserId);

                // 2. Verificamos que exista (buena práctica para evitar NullPointerException)
                if (otherUserDto != null) {
                    // 3. Añadimos su USERNAME a la lista, no su ID
                    otherUsernames.add(otherUserDto.getUsername());
                } else {
                    // Opcional: Qué hacer si el usuario fue borrado o no existe
                    otherUsernames.add("Usuario Desconocido");
                }
            }
        }

        // 4. Construimos el objeto final
        return SendChatRoomsDTO.builder()
                .username(otherUsernames) // Ahora pasamos la lista de nombres reales
                .chatRooms(rooms)
                .build();
    }

    // --- ENVIAR MENSAJE ---
    public ChatMessageDTO sendChatMessage(ChatMessageDTO dto) {

        String userId = dto.getSenderId();
        // 1. Preparar la entidad del mensaje (Lo hacemos primero, es lo prioritario)
        ChatMessage newChatMessage = chatMapper.chatMessageDtoToEntity(dto);

        newChatMessage.setId(UUID.randomUUID().toString());
        newChatMessage.setType("message");
        newChatMessage.setTimestamp(LocalDateTime.now());
        // Aseguramos que el sender sea el usuario autenticado (userId viene del
        // Controller)
        newChatMessage.setSenderId(userId);
        newChatMessage.setRoomId(dto.getRoomId()); // Asegurar Partition Key

        // 2. Guardar el mensaje (Cosmos DB Write)
        // Hacemos esto ANTES de actualizar la sala para asegurar latencia mínima
        ChatMessage savedMessage = chatRepository.save(newChatMessage);

        // 3. Actualizar metadatos de la sala (Cosmos DB Read + Write)
        // NOTA: Ya no verificamos permisos aquí, confiamos en el Interceptor.
        // Solo traemos la sala para actualizar la vista previa "Último mensaje..."
        ChatRoom room = chatRoomRepository.findRoomById(dto.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La sala no existe"));

        room.setLastMessagePreview(savedMessage.getContent());
        room.setLastMessageTime(savedMessage.getTimestamp());
        room.setLastMessageSenderId(savedMessage.getSenderId());

        for (String participantId : room.getParticipants()) {
            if (!participantId.equals(userId)) { // No incrementamos al que envía

                // Obtenemos el mapa actual (o lo creamos si es null)
                Map<String, Integer> counts = room.getUnreadCount();
                if (counts == null)
                    counts = new HashMap<>();

                // Sumamos 1
                int currentCount = counts.getOrDefault(participantId, 0);
                counts.put(participantId, currentCount + 1);

                room.setUnreadCount(counts);
            }
        }

        chatRoomRepository.save(room);

        return chatMapper.chatMessageEntityToDTO(savedMessage);
    }

    // ... (el método createChatRoom se queda igual) ...
    public ChatRoom createChatRoom(String user1, String user2) {
        UserDTO user = userService.getUserByUsername(user2);
        String UserId2 = user.getId();
        if (user == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El usuario no existe");
        String generatedId = (user1.compareTo(UserId2) < 0) ? user1 + "_" + UserId2 : UserId2 + "_" + user1;
        Optional<ChatRoom> existing = chatRoomRepository.findRoomById(generatedId);
        if (existing.isPresent())
            return existing.get();

        ChatRoom newRoom = ChatRoom.builder()
                .id(generatedId)
                .type("chatRoom")
                .participants(List.of(user1, UserId2))
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .build();
        return chatRoomRepository.save(newRoom);
    }

    public void readedMessage(String roomId, String userId) {
        // 1. Buscamos la sala. Si NO existe, lanzamos error inmediatamente.
        ChatRoom room = chatRoomRepository.findRoomById(roomId)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada"));

        if (room.getParticipants() == null || !room.getParticipants().contains(userId)) {
            throw new IllegalArgumentException("El usuario no pertenece a este chat");
        }
        Map<String, Integer> counts = room.getUnreadCount();

        // Si el mapa no existe, lo creamos para evitar NullPointerException
        if (counts == null) {
            counts = new HashMap<>();
        }

        // 3. Reseteamos a 0 SOLO el contador de este usuario
        // Usamos 'put' para sobrescribir el valor anterior
        counts.put(userId, 0);

        // 4. Actualizamos el mapa en la entidad
        room.setUnreadCount(counts);

        // 5. Guardamos
        chatRoomRepository.save(room);
    }

}