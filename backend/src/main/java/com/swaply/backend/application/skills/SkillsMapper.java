package com.swaply.backend.application.skills;


import org.mapstruct.*;

@Mapper(componentModel = "spring",
        // Si campo esta vacio "null" en el DTO no lo añade al entity "modelo"
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)

public interface SkillsMapper {

}
