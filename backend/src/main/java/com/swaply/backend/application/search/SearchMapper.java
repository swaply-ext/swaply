package com.swaply.backend.application.search;

import com.swaply.backend.application.search.dto.SkillItemDTO;
import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SearchMapper {

   public UserSwapDTO toDTO(User user, UserSkills mainSkill, boolean isMatch, String distance) {
        UserSwapDTO userSwapDTO = mapBasicUserJson(user);
        
        userSwapDTO.setRating(user.getRating() != null ? user.getRating() : 5.0);
        userSwapDTO.setDistance(distance);
        userSwapDTO.setSwapMatch(isMatch);

        String rawName = (mainSkill.getName() != null && !mainSkill.getName().isEmpty()) 
                         ? mainSkill.getName() : mainSkill.getId();
                         
        userSwapDTO.setSkillName("Clase de " + capitalize(rawName));
        userSwapDTO.setSkillIcon(mainSkill.getIcon() != null ? mainSkill.getIcon() : "🎓");
        userSwapDTO.setSkillCategory(mainSkill.getCategory());
        userSwapDTO.setSkillLevel(mainSkill.getLevel());

        return userSwapDTO;
    }

    public UserSwapDTO toSingleProfileDTO(User user) {
        UserSwapDTO userSwapDTO = mapBasicUserJson(user);

        userSwapDTO.setRating(4.8);
        userSwapDTO.setDistance("Cerca de ti");
        userSwapDTO.setSwapMatch(false);

        if (user.getSkills() != null && !user.getSkills().isEmpty()) {
            UserSkills firstSkill = user.getSkills().get(0);
            userSwapDTO.setSkillName(firstSkill.getName() != null ? firstSkill.getName() : firstSkill.getId());
            userSwapDTO.setSkillIcon(firstSkill.getIcon() != null ? firstSkill.getIcon() : "🎓");
            userSwapDTO.setSkillLevel(firstSkill.getLevel());
            userSwapDTO.setSkillCategory(firstSkill.getCategory());
        }

        return userSwapDTO;
    }

    private UserSwapDTO mapBasicUserJson(User user) {
        UserSwapDTO userSwapDTO = new UserSwapDTO();
        userSwapDTO.setUserId(user.getId());
        userSwapDTO.setName(user.getName());
        userSwapDTO.setUsername(user.getUsername());
        userSwapDTO.setProfilePhotoUrl(user.getProfilePhotoUrl());

        if (user.getLocation() != null) {
            userSwapDTO.setLocation(user.getLocation().getDisplayName());
        }

        userSwapDTO.setUserSkills(mapSkillList(user.getSkills()));
        userSwapDTO.setInterests(mapSkillList(user.getInterests()));
        return userSwapDTO;
    }

    private List<SkillItemDTO> mapSkillList(List<UserSkills> skills) {
        if (skills == null) return Collections.emptyList();
        
        return skills.stream()
                .map(skill -> new SkillItemDTO(
                        skill.getName() != null ? skill.getName() : skill.getId(),
                        skill.getCategory(),
                        skill.getLevel()
                )).collect(Collectors.toList());
    }

    private String capitalize(String textToCapitalize) {
        if (textToCapitalize == null || textToCapitalize.isEmpty()) return textToCapitalize;
        return textToCapitalize.substring(0, 1).toUpperCase() + textToCapitalize.substring(1).toLowerCase();
    }
}