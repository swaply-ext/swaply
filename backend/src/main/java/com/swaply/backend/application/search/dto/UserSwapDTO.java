package com.swaply.backend.application.search.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSwapDTO {
    private String userId;
    private String name;
    private String username;
    private String profilePhotoUrl;
    private String location;

    // Info de la Skill encontrada
    private String skillName;     
    private String skillIcon;     
    private Integer skillLevel;   
    private String skillCategory;

    // Info del Match
    private boolean isSwapMatch;  
    private Double rating;        
    private String distance;
}