package com.swaply.backend.shared.UserCRUD.dto;

import java.util.List;

import com.swaply.backend.shared.UserCRUD.Model.UserSkills;

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
    private String location;
    private String gender;
    private String description;
    private String phone;
    private List<UserSkills> skills;
    private List<UserSkills> interests;
    private boolean isVerified;
    private String profilePhotoUrl;
    private boolean isPremium;
    private boolean isModerator;
}