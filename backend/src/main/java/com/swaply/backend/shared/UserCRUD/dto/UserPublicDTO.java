package com.swaply.backend.shared.UserCRUD.dto;

import java.sql.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.swaply.backend.shared.UserCRUD.Model.Location;
import com.swaply.backend.shared.UserCRUD.Model.Swap;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPublicDTO {
    private String id;
    private String username;
    private String name;
    private String surname;
    private Location location;
    private String gender;
    private List<UserSkills> skills;
    private List<UserSkills> interests;
    @JsonFormat(pattern="dd/MM/yyyy")
    private Date birthDate;
    private String description;
    private boolean isVerified;
    private String profilePhotoUrl;
    private boolean isPremium;
    private boolean isModerator;
    private List<Swap> swaps;
}