package com.swaply.backend.application.auth.dto;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterActivationDTO {
    // private String id;
    private String email;
    private String code;
}