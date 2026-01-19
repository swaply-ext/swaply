package com.swaply.backend.application.home;

import com.swaply.backend.application.home.dto.RecommendationDTO;
import com.swaply.backend.application.skills.dto.SkillDisplayDTO;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;

import org.mapstruct.*;

@Mapper(componentModel = "spring",
                // Si campo esta vacio "null" en el DTO no lo añade al entity "modelo"
                nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)

public interface HomeMapper {
        RecommendationDTO toRecommendationDTO(UserDTO user, SkillDisplayDTO skill, String distance, Double rating, Boolean swapMatch);
}
