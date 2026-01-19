package com.swaply.backend.application.home.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.swaply.backend.application.skills.dto.SkillDisplayDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationDTO {
    private String username;
    private String profilePhotoUrl;

    // Info de la Skill principal (Match)
    private SkillDisplayDTO skill;

    // Info del Match
    @JsonProperty("isSwapMatch")
    private boolean isSwapMatch;  
    
    private Double rating;        
    private String distance;
}
