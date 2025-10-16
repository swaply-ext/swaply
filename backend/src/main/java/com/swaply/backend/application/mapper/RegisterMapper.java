package com.swaply.backend.application.mapper;

import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.domain.model.Register;
import org.mapstruct.*;

@Mapper(
    componentModel = "spring",
    // Por defecto, a nivel de mapper no tocamos nulos; lo controlamos por método.
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL
)
public interface RegisterMapper {

    // DTO -> Entity para creación
    // - Ignoramos id (lo setea el service)
    // - Forzamos type="user" como en tu implementación original
    @Mappings({
        @Mapping(target = "id", ignore = true),
        @Mapping(target = "type", constant = "user")
    })
    Register toEntity(RegisterDTO dto);

    // Entity -> DTO
    RegisterDTO toDTO(Register entity);

    // UPDATE parcial: copia sólo campos NO nulos del DTO sobre la entidad existente
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mappings({
        @Mapping(target = "id", ignore = true),       // El id nunca se actualiza desde el DTO
        @Mapping(target = "type", ignore = true),     // No queremos que cambie (fijado a "user")
        @Mapping(target = "password", ignore = true)  // Seguridad: gestionar password en el service
    })
    void updateFromDto(RegisterDTO dto, @MappingTarget Register entity);
}
