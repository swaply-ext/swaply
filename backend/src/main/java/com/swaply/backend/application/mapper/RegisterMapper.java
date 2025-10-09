package com.swaply.backend.application.mapper;


import com.swaply.backend.application.dto.RegisterDTO;
import com.swaply.backend.domain.model.Register;


public class RegisterMapper {
    
    private RegisterMapper() {
        // Evitar instanciación
    }

    public static Register toEntity(RegisterDTO dto) {
        Register entity = new Register();
        entity.setId(dto.getId());
        entity.setEmail(dto.getEmail());
        entity.setType(dto.getType());
        entity.setPassword(dto.getPassword());
        return entity;
    }

    public static RegisterDTO toDTO(Register entity){
        RegisterDTO dto = new RegisterDTO();
        dto.setId(entity.getId());
        dto.setEmail(entity.getEmail());
        dto.setType(entity.getType());
        dto.setPassword(entity.getPassword());
        return dto;
    }
}
