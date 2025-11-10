package com.swaply.backend.application.account.dto;

import java.util.List;

import com.swaply.backend.shared.UserCRUD.Model.Skills;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDataDTO {
    private String name;
    private String surname;
    private String username;
    private String location;
    private String description;
    private List<Skills> interests;
    private List<Skills>skills;
    private String profilePhotoUrl;

}

// NO TOCAR --- EN DESARROLLO ALEIX I ARNAU, NOOOOO TOCAR !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Hace falta el maper y el service para entrar en lógica y hacer el funcionamiento del flujo.
