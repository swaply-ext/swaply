
package com.swaply.backend.shared.UserCRUD;

import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.UserCRUD.dto.UserPublicDTO;

import org.mapstruct.*;

@Mapper(componentModel = "spring",
        // Si campo esta vacio "null" en el DTO no lo añade al entity "modelo"
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {
    // Crea si los nombres de las variables son exactamente iguales
    UserDTO entityToDTO(User user);

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "type", ignore = true)
    })
    User dtoToEntity(UserDTO dto);

    @Mappings({
            @Mapping(target = "id", ignore = true),
    })
    UserPublicDTO entityToPublicDTO(User entity);

    @Mappings({
            @Mapping(target = "id", ignore = true),
    })
    UserDTO publicDTOToUserDTO(UserPublicDTO dto);


    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "type", ignore = true),
            @Mapping(target = "premium", ignore = true),//no se si hace falta esto, no cabe duda
            @Mapping(target = "moderator", ignore = true)
    })
    // Actualiza uno ya existente (usa la lógica de mapeo que tiene justo encima)
    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateUserFromDto(UserDTO dto, @MappingTarget User entity);
}
