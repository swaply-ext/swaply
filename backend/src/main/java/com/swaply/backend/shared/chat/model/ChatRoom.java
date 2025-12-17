package com.swaply.backend.shared.chat.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Container(containerName = "swaply-container")
public class ChatRoom {

    @Id
    private String id; // Recomendado: "room_" + UUID o un hash de los participantes

    @PartitionKey
    private String type = "chatRoom"; // Discriminador constante para el contenedor compartido

    /**
     * Lista de IDs de los usuarios que participan.
     * Es vital para buscar: "Dame todos los chats donde esté el usuario X"
     */
    private List<String> participants;

    /**
     * Denormalización: Guardamos el último mensaje aquí para que la lista 
     * de chats del usuario se cargue sin tener que buscar en la tabla de mensajes.
     */
    private String lastMessagePreview;
    private LocalDateTime lastMessageTime;
    private String lastMessageSenderId;

    /**
     * Opcional: Para mostrar un contador de mensajes no leídos por usuario.
     * Ejemplo: {"user123": 5, "user456": 0}
     */
    private Map<String, Integer> unreadCount;

    /**
     * Metadatos adicionales
     */
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Indica si la sala está activa (por si alguien bloquea o sale del chat)
    private boolean isActive = true;
}