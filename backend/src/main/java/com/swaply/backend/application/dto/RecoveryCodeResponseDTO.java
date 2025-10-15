package com.swaply.backend.application.dto;

public class RecoveryCodeResponseDTO {
    private String userId;
    private String code;

    public RecoveryCodeResponseDTO(String userId, String code) {
        this.userId = userId;
        this.code = code;
    }

    // Getters y setters
    public String getUserId() {
        return userId;
    }

    public String getCode() {
        return code;
    }
}