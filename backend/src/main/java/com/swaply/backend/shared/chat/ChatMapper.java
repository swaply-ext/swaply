package com.swaply.backend.shared.chat;

import org.mapstruct.*;
import com.swaply.backend.shared.chat.dto.ChatMessageDTO;
import com.swaply.backend.shared.chat.dto.ChatRoomDTO;
import com.swaply.backend.shared.chat.model.ChatMessage;
import com.swaply.backend.shared.chat.model.ChatRoom;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ChatMapper {

    // 1. DTO a Entidad
    @Mappings({
        @Mapping(target = "id", ignore = true),
        @Mapping(target = "timestamp", ignore = true) // Ignoramos porque lo generas con Instant.now() en el servicio
    })
    ChatMessage chatMessageDtoToEntity(ChatMessageDTO chatMessageDTO);

    // 2. Entidad a DTO
    @Mappings({
        // CORRECCIÓN: Ignorar pageNumber porque la entidad no lo tiene, es solo para requests
        @Mapping(target = "pageNumber", ignore = true) 
    })
    ChatMessageDTO chatMessageEntityToDTO(ChatMessage chatMessage);

    // 3. Room DTO a Entidad
    @Mappings({
        @Mapping(target = "id", ignore = true),
    })
    ChatRoom chatRoomDtoToEntity(ChatRoomDTO chatRoomDTO);

    ChatRoomDTO chatRoomEntityToDTO(ChatRoom chatRoom);
}