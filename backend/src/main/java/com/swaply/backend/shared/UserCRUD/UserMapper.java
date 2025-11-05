
package com.swaply.backend.shared.UserCRUD;

import com.swaply.backend.application.account.dto.ProfileDataDTO;
import com.swaply.backend.application.auth.dto.RegisterDTO;
import com.swaply.backend.application.auth.dto.RegisterInitialDTO;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.dto.UpdateUserDTO;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;

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
    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateUserFromDto(UpdateUserDTO dto, @MappingTarget User entity);

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
    User fromRegisterTtlDTO(RegisterInitialDTO dto);


    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    ProfileDataDTO userToProfileDataDTO(User user);
}
