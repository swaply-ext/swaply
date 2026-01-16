package com.swaply.backend.application.home;

import com.swaply.backend.shared.UserCRUD.Model.UserSkills;

import java.util.List;

import org.mapstruct.*;

@Mapper(componentModel = "spring",
                // Si campo esta vacio "null" en el DTO no lo añade al entity "modelo"
                nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)

public interface HomeMapper {

        
}
