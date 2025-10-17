package com.swaply.backend.application.dto;

public class RecoveryPasswordRecieveDTO {
    private String userId;
    private String newPassword;

    public RecoveryPasswordRecieveDTO(String userId, String code) {
        this.userId = userId;
    }
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    
}