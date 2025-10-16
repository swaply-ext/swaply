
package com.swaply.backend.application.mapper;

import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.domain.model.User;
import org.mapstruct.*;

@Mapper(
    componentModel = "spring",
    // Por defecto, ignora propiedades nulas al mapear (ideal para partial update)
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {

    // Entity -> DTO
    UserDTO entityToDTO(User user);

    // DTO -> Entity (creación completa; aquí SÍ copia todos los campos)
    User dtoToEntity(UserDTO dto);

    // UPDATE parcial: copia solo campos NO nulos del DTO sobre la entidad existente
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mappings({
        // Nunca sobreescribas el id al actualizar una entidad existente
        @Mapping(target = "id", ignore = true)
        // Si NO quieres que el password se actualice vía este DTO, descomenta:
        // @Mapping(target = "password", ignore = true)
    })
    void updateUserFromDto(UserDTO dto, @MappingTarget User entity);
}
