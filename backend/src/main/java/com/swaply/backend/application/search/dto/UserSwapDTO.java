package com.swaply.backend.application.search.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.swaply.backend.application.skills.dto.SkillDisplayDTO;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;

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

    // Info de la Skill principal (Match)
    private SkillDisplayDTO skill;

    // Info del Match
    @JsonProperty("isSwapMatch")
    private boolean isSwapMatch;  
    
    private Double rating;        
    private String distance;

    // Lista de todas las skills
    private List<UserSkills> userSkills;
    private List<UserSkills> interests;
}