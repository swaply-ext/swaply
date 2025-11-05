package com.swaply.backend.application.account.dto;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalInfoDTO {
    private String name;
    private String surname;
    private Date birthDate;
    private String gender;
    private String phone;
    private String location;
    private String postalCode;
}
