package com.swaply.backend.application.account.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

import com.swaply.backend.shared.UserCRUD.Model.UserSkills;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditProfileDTO {
    private String profilePhotoUrl;
    private String name;
    private String surname;
    private String username;
    private String description;
    private String email;
    private List<UserSkills> skills;
    private List<UserSkills> interests;
    private Date birthDate;
    private String location;
    private String gender;
}
