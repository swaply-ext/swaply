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
        entity.setType("user");
        entity.setPassword(dto.getPassword());
        entity.setName(dto.getName());
        entity.setSurname(dto.getSurname());
        entity.setBirthDate(dto.getBirthDate());
        entity.setPhone(dto.getPhone());
        entity.setPostalCode(dto.getPostalCode());
        entity.setLocation(dto.getLocation());
        return entity;
    }

    public static RegisterDTO toDTO(Register entity){
        RegisterDTO dto = new RegisterDTO();
        dto.setId(entity.getId());
        dto.setEmail(entity.getEmail());
        dto.setType(entity.getType());
        dto.setPassword(entity.getPassword());
        dto.setName(entity.getName());
        dto.setSurname(entity.getSurname());
        dto.setBirthDate(entity.getBirthDate());
        dto.setPhone(entity.getPhone());
        dto.setPostalCode(entity.getPostalCode());
        dto.setLocation(entity.getLocation());
        return dto;
    }
}
