package com.swaply.backend.shared.chat;

import org.mapstruct.*;

import com.swaply.backend.shared.chat.dto.ChatMessageDTO;
import com.swaply.backend.shared.chat.dto.ChatRoomDTO;
import com.swaply.backend.shared.chat.model.ChatMessage;
import com.swaply.backend.shared.chat.model.ChatRoom;

@Mapper(componentModel = "spring",
        // Si campo esta vacio "null" en el DTO no lo añade al entity "modelo"
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)

public interface ChatMapper {
    ChatMessage chatMessageDtoToEntity(ChatMessageDTO chatMessageDTO);
    

    ChatMessageDTO chatMessageEntityToDTO(ChatMessage chatMessage);
    @Mappings({
            @Mapping(target = "id", ignore = true),
    })

    ChatRoom chatRoomDtoToEntity(ChatRoomDTO chatRoomDTO);

    ChatRoomDTO chatRoomEntityToDTO(ChatRoom chatRoom);
}
