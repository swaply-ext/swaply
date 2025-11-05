package com.swaply.backend.application.auth;

import com.swaply.backend.application.auth.dto.RegisterInitialDTO;
import com.swaply.backend.application.auth.dto.ResetPasswordDTO;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;

import org.mapstruct.*;

@Mapper(componentModel = "spring",
        // Si campo esta vacio "null" en el DTO no lo añade al entity "modelo"
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)

public interface AuthMapper {
    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    UserDTO fromRegisterDTO(RegisterInitialDTO dto);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    UserDTO fromResetPasswordDTO(ResetPasswordDTO dto);
}
