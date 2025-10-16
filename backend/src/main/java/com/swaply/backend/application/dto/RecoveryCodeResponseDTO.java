package com.swaply.backend.application.dto;

public class RecoveryCodeResponseDTO {
    private String userId;
    private String code;

    public RecoveryCodeResponseDTO(String userId, String code) {
        this.userId = userId;
        this.code = code;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

}