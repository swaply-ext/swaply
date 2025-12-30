package com.swaply.backend.application.account.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import com.swaply.backend.shared.UserCRUD.Model.Location;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;


@Data 
@NoArgsConstructor 
@AllArgsConstructor 
public class PublicProfileDTO {

    private String fullName;
    private String name;
    private String surname;
    private String username;
    private Location location;
    private String description;
    private String profilePhotoUrl;
    private List<UserSkills> interests;
    private List<UserSkills> skills;
}