package com.swaply.backend.shared.UserCRUD.dto;

import java.sql.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String type;
    private String username;
    private String name;
    private String surname;
    private String email;
    private String password;
    private Integer code;
    private Integer ttl;
    private String location;
    private String postalCode;
    private String gender;
    private String phone;
    private List<UserSkills> skills;
    private List<UserSkills> interests;
    @JsonFormat(pattern="dd/MM/yyyy")
    private Date birthDate;
    private String description;
    private boolean isVerified;
    private String profilePhotoUrl;
    private boolean isPremium;
    private boolean isModerator;
}