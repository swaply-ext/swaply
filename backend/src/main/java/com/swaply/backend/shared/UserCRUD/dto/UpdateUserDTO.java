package com.swaply.backend.shared.UserCRUD.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserDTO {
    private String username;
    private String name;
    private String surname;
    private String email;
    private String password;
    private String location;
    private String gender;
    private String description;
    private boolean isVerified;
    private String profilePhotoUrl;
    private boolean isPremium;
    private boolean isModerator;
}