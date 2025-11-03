package com.swaply.backend.application.account;

import com.swaply.backend.application.account.dto.SkillsDTO;
import com.swaply.backend.shared.UserCRUD.dto.UpdateUserDTO;

import org.mapstruct.*;

@Mapper(componentModel = "spring",
        // Si campo esta vacio "null" en el DTO no lo añade al entity "modelo"
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)

public interface AccountMapper {

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    UpdateUserDTO fromSkillsDTO(SkillsDTO dto);
}
