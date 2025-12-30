package com.swaply.backend.application.account.dto;

import java.util.List;

import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import com.swaply.backend.shared.UserCRUD.Model.Location;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDataDTO {
    private String name;
    private String surname;
    private String username;
    private Location location;
    private String description;
    private List<UserSkills> interests;
    private List<UserSkills>skills;
    private String profilePhotoUrl;
}
