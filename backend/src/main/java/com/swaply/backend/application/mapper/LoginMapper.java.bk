package com.swaply.backend.application.mapper;


import com.swaply.backend.application.dto.LoginDTO;
import com.swaply.backend.domain.model.Login;


public class LoginMapper {
    
    private LoginMapper() {
        // Evitar instanciación
    }

    public static Login toEntity(LoginDTO dto) {
        Login entity = new Login();
        entity.setEmail(dto.getEmail());
        entity.setPassword(dto.getPassword());
        return entity;
    }

    public static LoginDTO toDTO(LoginDTO entity){
        LoginDTO dto = new LoginDTO();
        dto.setEmail(entity.getEmail());
        dto.setPassword(entity.getPassword());
        return dto;
    }
}