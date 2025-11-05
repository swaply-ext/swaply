package com.swaply.backend.application.account.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDataDTO {
    private String fullName;
    private String username;
    private String location;
    private String description;
}

// NO TOCAR --- EN DESARROLLO ALEIX I ARNAU, NOOOOO TOCAR !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Hace falta el maper y el service para entrar en lógica y hacer el funcionamiento del flujo.
