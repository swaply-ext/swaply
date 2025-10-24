package com.swaply.backend.shared.UserCRUD.dto;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonFormat;

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
    private String location;
    private String gender;
    private ArrayList<String> skills;
    private ArrayList<String> interest;
    @JsonFormat(pattern="dd/MM/yyyy")
    private Date birthDate;
    private String description;
    private boolean isVerified;
    private String profilePhotoUrl;
    private boolean isPremium;
    private boolean isModerator;
}