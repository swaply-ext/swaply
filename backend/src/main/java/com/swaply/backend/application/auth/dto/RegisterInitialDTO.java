package com.swaply.backend.application.auth.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterInitialDTO {
    // private String id;
    private String email;
    private String password;
    private String username;
    private Integer ttl = 300;
    private Integer code;
}