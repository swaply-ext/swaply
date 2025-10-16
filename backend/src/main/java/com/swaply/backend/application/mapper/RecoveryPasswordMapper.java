package com.swaply.backend.application.mapper;


import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.application.dto.RecoveryPasswordDTO;
import com.swaply.backend.domain.model.Login;
import com.swaply.backend.domain.model.User;


public class RecoveryPasswordMapper {
    
    private RecoveryPasswordMapper() {
        // Evitar instanciación
    }

    public static User toEntity(RecoveryPasswordDTO dto) {
        User entity = new User();
        entity.setPassword(dto.getPassword());
        return entity;
    }

    public static RecoveryPasswordDTO toDTO(LoginDTO entity){
        RecoveryPasswordDTO dto = new RecoveryPasswordDTO();
        dto.setPassword(entity.getPassword());
        return dto;
    }
}