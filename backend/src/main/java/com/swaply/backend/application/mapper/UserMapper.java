
package com.swaply.backend.application.mapper;

import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.domain.model.User;
import org.mapstruct.*;

@Mapper(
    componentModel = "spring",
   //Si  campo esta vacio "null" en el DTO no lo añade al entity "modelo"
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {
    //Crea si los nombres de las variables son exactamente iguales
    UserDTO entityToDTO(User user);
    User dtoToEntity(UserDTO dto);

    @Mappings({
        @Mapping(target = "id", ignore = true),
        @Mapping(target = "type", ignore = true)
    })
    //Actualiza uno ya existente (usa la lógica de mapeo que tiene justo encima)
    void updateUserFromDto(UserDTO dto, @MappingTarget User entity);

    @Mappings({
        // Campos que el mapper no tocará
        @Mapping(target = "id", ignore = true),
        @Mapping(target = "password", ignore = true), 
        @Mapping(target = "type", ignore = true),
        @Mapping(target = "verified", ignore = true),
        @Mapping(target = "premium", ignore = true),
        @Mapping(target = "moderator", ignore = true)

    })
    //Completamente opcional solo quita un warning pero me estaba rallando
    //El warning es porque el register dto no tiene los mismos campos que el modelo user pero esa es la idea de un DTO
    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    //Usa la lógica de mapeo que tiene justo encima
    User fromRegisterDTO(RegisterDTO dto);
}
