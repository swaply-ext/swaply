package com.swaply.backend.shared.chat.service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.data.domain.Pageable;

import com.azure.cosmos.models.CosmosPatchOperations;
import com.swaply.backend.shared.chat.repository.ChatRoomRepository;
import com.azure.cosmos.models.PartitionKey;
import com.azure.spring.data.cosmos.core.CosmosTemplate;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.UserCRUD.exception.UserNotFoundException;
import com.swaply.backend.shared.chat.ChatMapper;
import com.swaply.backend.shared.chat.dto.ChatMessageDTO;
import com.swaply.backend.shared.chat.dto.SendChatRoomsDTO;
import com.swaply.backend.shared.chat.exception.RoomNotFoundException;
import com.swaply.backend.shared.chat.exception.UserNotInThisRoomException;
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
                .orElseThrow(() -> new RoomNotFoundException("La sala no existe")); // CREAR EXCEPCION

        if (!room.getParticipants().contains(userId)) {
            throw new UserNotInThisRoomException("Este usuario no pertenece a esta sala"); // CREAR EXCEPCION MIRAR
        }

        // Paginación correcta
        Pageable pageRequest = PageRequest.of(pageNumber, 20, Sort.by("timestamp").descending());

        // Buscamos explícitamente en la partición 'message'
        Page<ChatMessage> page = chatRepository.findByRoomIdAndType(roomId, "message", pageRequest);

        return page.getContent();
    }

    public SendChatRoomsDTO getChatRoomsByUserId(String userId) {
        List<ChatRoom> rooms = chatRoomRepository.findRoomsByUserId(userId);

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
                String otherUsername = userService.getUsernameById(otherUserId);

                // 2. Verificamos que exista (buena práctica para evitar NullPointerException)
                if (otherUsername != null) {
                    // 3. Añadimos su USERNAME a la lista, no su ID
                    otherUsernames.add(otherUsername);
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

    @Async // Ejecuta este método en un hilo separado
    public void updateRoomMetadataAsync(String roomId, ChatMessage message) {
        // 1. Buscamos la sala para obtener la lista de participantes actual.
        // Usamos el método optimizado del repositorio.
        ChatRoom room = chatRoomRepository.findRoomById(roomId)
                .orElse(null); // Si no existe, salimos silenciosamente (o loggeamos error)

        if (room == null)
            return;

        // 2. Preparamos las operaciones PATCH (Solo enviamos cambios, no todo el
        // objeto)
        CosmosPatchOperations patchOps = CosmosPatchOperations.create()
                .set("/lastMessagePreview", message.getContent())
                .set("/lastMessageTime", message.getTimestamp()) // Asegúrate que sea un formato válido para JSON/String
                .set("/lastMessageSenderId", message.getSenderId());

        // 3. Calculamos los contadores de "no leídos"
        // Incrementamos +1 a todos los participantes MENOS al que envió el mensaje.
        String senderId = message.getSenderId();

        if (room.getParticipants() != null) {
            for (String participantId : room.getParticipants()) {
                if (!participantId.equals(senderId)) {
                    // Ruta en el JSON: { "unreadCount": { "userId": 5 } }
                    // Cosmos Patch "increment" es atómico y thread-safe en el servidor.
                    // NOTA: Asegúrate de que 'unreadCount' esté inicializado como {} al crear la
                    // sala.
                    patchOps.increment("/unreadCount/" + participantId, 1);
                }
            }
        }

        // 4. Ejecutamos el Patch contra la base de datos
        // Usamos la constante del repositorio para la Partition Key
        cosmosTemplate.patch(
                roomId,
                new PartitionKey(ChatRoomRepository.TYPE_CHATROOM),
                ChatRoom.class,
                patchOps);
    }

    public ChatMessageDTO sendChatMessage(ChatMessageDTO dto) {

        // 1. Construir la entidad
        ChatMessage newChatMessage = chatMapper.chatMessageDtoToEntity(dto);
        newChatMessage.setId(UUID.randomUUID().toString());
        newChatMessage.setType("message"); // Partition Key si usas single container
        newChatMessage.setTimestamp(LocalDateTime.now(ZoneOffset.UTC)); // Siempre UTC
        // senderId y roomId ya vienen seteados y validados desde el Controller

        // 2. Guardar el mensaje (Operación Bloqueante Crítica)
        // Esto es lo único que esperamos para confirmar al usuario.
        ChatMessage savedMessage = chatRepository.save(newChatMessage);

        // 3. Actualizar sala (Operación Asíncrona "Fire & Forget")
        // Llamamos al método @Async de la otra clase. Spring maneja el hilo.
        updateRoomMetadataAsync(savedMessage.getRoomId(), savedMessage);

        // 4. Retornar DTO inmediato
        return chatMapper.chatMessageEntityToDTO(savedMessage);
    }

    public ChatRoom createChatRoom(String user1, String user2) {
        // user1: current user id (from SecurityUser.getUsername())
        // user2: target username (from frontend)
        if (user1 == null) throw new UserNotFoundException("Usuario remitente nulo");

        UserDTO user = userService.getUserByUsername(user2);
        if (user == null) {
            throw new UserNotFoundException("El usuario objetivo no existe: " + user2);
        }
    String UserId2 = user.getId();
    System.out.println("[ChatService] createChatRoom user1(id)=" + user1 + " targetUsername=" + user2 + " targetId=" + UserId2);

        String generatedId = (user1.compareTo(UserId2) < 0) ? user1 + "_" + UserId2 : UserId2 + "_" + user1;

        Optional<ChatRoom> existing = chatRoomRepository.findRoomById(generatedId);
        if (existing.isPresent())
            return existing.get();

        // 1. PREPARAR EL MAPA DE NO LEÍDOS
        // Es vital inicializarlo con 0 para ambos participantes.
        Map<String, Integer> initialUnreadMap = new HashMap<>();
        initialUnreadMap.put(user1, 0);
        initialUnreadMap.put(UserId2, 0);

    ChatRoom newRoom = ChatRoom.builder()
                .id(generatedId)
                .type("chatRoom")
                .participants(List.of(user1, UserId2))
                .unreadCount(initialUnreadMap) // <--- ESTO ES LO QUE FALTABA
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .build();

    ChatRoom saved = chatRoomRepository.save(newRoom);
    System.out.println("[ChatService] created ChatRoom id=" + saved.getId());
    return saved;
    }

    public void readedMessage(String roomId, String userId) {
        // 1. Validar existencia (opcional, pero recomendado)
        if (!chatRoomRepository.existsById(roomId)) {
            throw new RoomNotFoundException("La sala no existe");
        }

        // 2. Preparar el Patch: Resetear a 0 el contador de este usuario
        // La ruta es: /unreadCount/{userId}
        CosmosPatchOperations patchOps = CosmosPatchOperations.create()
                .set("/unreadCount/" + userId, 0);

        // 3. EJECUTAR EL PATCH
        // Sintaxis: cosmosTemplate.patch(partitionKey, tipoDeClase, operaciones)
        // NOTA: Si tu @Id es el mismo que la PartitionKey, pasas el roomId como primer
        // argumento.

        cosmosTemplate.patch(
                roomId, // Arg 1: El ID del documento (String)
                new PartitionKey(chatRoomRepository.TYPE_CHATROOM), // Arg 2: La Partition Key (Objeto) <--- AQUÍ ESTABA
                ChatRoom.class, // Arg 3: La clase entidad
                patchOps // Arg 4: Las operaciones
        );
    }

    public boolean isUserInRoom(String roomId, String username) {
        // 1. Buscamos la sala por ID
        // En Cosmos DB, findById es muy eficiente (Point Read)
        Optional<ChatRoom> chatRoomOpt = chatRoomRepository.findById(roomId);

        if (chatRoomOpt.isEmpty()) {
            return false; // La sala no existe
        }

        ChatRoom room = chatRoomOpt.get();

        // 2. Verificamos si el usuario está en la lista de participantes
        // Asumo que tu modelo ChatRoom tiene un campo List<String> participantIds
        if (room.getParticipants() != null) {
            return room.getParticipants().contains(username);
        }

        return false;
    }

}
