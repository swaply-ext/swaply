package com.swaply.backend.application.skills;

import com.swaply.backend.application.skills.dto.SkillDisplayDTO;
import com.swaply.backend.shared.UserCRUD.Model.Skills;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
                // Si campo esta vacio "null" en el DTO no lo añade al entity "modelo"
                nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)

public interface SkillsMapper {

        @Mapping(target = "id", source = "userSkill.id")
        SkillDisplayDTO toDisplayDTO(Skills skill, UserSkills userSkill);
}
