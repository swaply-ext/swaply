package com.swaply.backend.application.dto;

import lombok.Data;

@Data
public class LoginDTO {
    private String email;
    private String password;

    public LoginDTO() {
        // Constructor vacío necesario para Jackson
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
