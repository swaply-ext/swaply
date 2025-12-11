package com.swaply.backend.application.account.dto;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.swaply.backend.shared.UserCRUD.Model.Location;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalInfoDTO {
    private String name;
    private String surname;
    private Date birthDate;
    private String gender;
    private String phone;
    private Location location;
    private String postalCode;
}
