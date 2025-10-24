package com.swaply.backend.application.auth.dto;

import java.time.LocalDate;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDTO {
    // private String id;
    private String email;
    private String password;
    private String name;
    private String surname;
    private String username;
    @JsonFormat(pattern="dd/MM/yyyy")
    private Date birthDate;
    private int phone;
    private int postalCode;
    private String location;
}