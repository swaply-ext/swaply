package com.swaply.backend.shared.chat;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
// IMPORTANTE: Estos son los imports correctos para paginación
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    public List<ChatMessage> getChatHistory(String id) {
        // 1. Crear la solicitud de paginación (Pageable correcto)
        Pageable pageRequest = PageRequest.of(0, 20, Sort.by("timestamp").descending());

        // 2. Ejecutar la consulta paginada
        // Corregido: Usamos 'roomId' en vez de 'id'
        // Corregido: Usamos el nombre del método que definimos en el repositorio (findByRoomId)
        Page<ChatMessage> page = chatRepository.findChatById(id, pageRequest);

        // 3. Devolver el contenido
        // Ahora .getContent() funcionará porque 'page' es del tipo correcto
        return page.getContent();
    }
}