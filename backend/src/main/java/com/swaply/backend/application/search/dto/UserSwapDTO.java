package com.swaply.backend.application.search.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSwapDTO {
    private String userId;
    private String name;
    private String username;
    private String profilePhotoUrl;
    private String location;
    private boolean premium;

    // Info de la Skill principal (Match)
    private String skillName;     
    private String skillIcon;     
    private Integer skillLevel;   
    private String skillCategory;

    // Info del Match
    @JsonProperty("isSwapMatch")
    private boolean isSwapMatch;  
    
    private Double rating;        
    private String distance;

    // Lista de todas las skills
    private List<SkillItemDTO> userSkills;
    private List<SkillItemDTO> interests;
}