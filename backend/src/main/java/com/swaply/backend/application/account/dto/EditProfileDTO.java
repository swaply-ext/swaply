package com.swaply.backend.application.account.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

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
    private Date birthDate;
    private String location;
    private String gender;
}
