package com.swaply.backend.application.account.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NavBarInformationDTO {
    private String name;
    private String surname;
    private String username;
    private String profilePhotoUrl;
    private boolean isPremium;
    private Integer msgCount;
    private Integer notificationCount;
    }
