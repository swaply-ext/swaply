package com.swaply.backend.application.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class LoginDTO {
    private String type = "user";
    private String email;
    private String password;

    public LoginDTO() {
        // Constructor vacío necesario para Jackson
    }

    public String getType() {
        return this.type;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


}
