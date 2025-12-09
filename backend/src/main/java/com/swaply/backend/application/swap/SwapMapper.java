package com.swaply.backend.application.swap;

import org.mapstruct.*;

import com.swaply.backend.application.swap.dto.SwapDTO;
import com.swaply.backend.shared.UserCRUD.Model.Swap;


@Mapper(componentModel = "spring",
        // Si campo esta vacio "null" en el DTO no lo añade al entity "modelo"
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)

public interface SwapMapper {

        @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
        Swap toEntity(SwapDTO dto);

}
