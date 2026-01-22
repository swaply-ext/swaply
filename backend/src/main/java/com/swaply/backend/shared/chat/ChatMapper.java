package com.swaply.backend.shared.chat;

import org.mapstruct.*;
import com.swaply.backend.shared.chat.dto.ChatMessageDTO;
import com.swaply.backend.shared.chat.dto.ChatRoomDTO;
import com.swaply.backend.shared.chat.model.ChatMessage;
import com.swaply.backend.shared.chat.model.ChatRoom;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ChatMapper {

    @Mappings({
        @Mapping(target = "id", ignore = true),
        @Mapping(target = "timestamp", ignore = true) // Ignoramos porque lo generas con Instant.now() en el servicio
    })
    ChatMessage chatMessageDtoToEntity(ChatMessageDTO chatMessageDTO);

    @Mappings({
        @Mapping(target = "pageNumber", ignore = true) 
    })
    ChatMessageDTO chatMessageEntityToDTO(ChatMessage chatMessage);

    @Mappings({
        @Mapping(target = "id", ignore = true),
    })
    ChatRoom chatRoomDtoToEntity(ChatRoomDTO chatRoomDTO);

    ChatRoomDTO chatRoomEntityToDTO(ChatRoom chatRoom);
}