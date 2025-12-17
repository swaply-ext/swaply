package com.swaply.backend.application.home.service;

import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class HomeService {

    private final UserRepository userRepository;

    public HomeService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private String normalizeString(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").toLowerCase().trim();
    }

    public List<UserSwapDTO> getRecommendedMatches(String currentUserId) {
        User me = userRepository.findUserById(currentUserId).orElse(null);
        if (me == null || me.getInterests() == null || me.getInterests().isEmpty()) {
            return List.of(); 
        }

        List<String> myInterestIds = me.getInterests().stream()
                .map(s -> normalizeString(s.getId()))
                .collect(Collectors.toList());
        
        Set<String> myOfferingIds = (me.getSkills() != null)
                ? me.getSkills().stream().map(s -> normalizeString(s.getId())).collect(Collectors.toSet())
                : Collections.emptySet();

        String myLocation = (me.getLocation() != null) ? normalizeString(me.getLocation()) : "";

        List<User> candidates = userRepository.findUsersByMultipleSkillIds(myInterestIds);
        List<UserSwapDTO> recommendations = new ArrayList<>();

        for (User otherUser : candidates) {
            if (otherUser.getId().equals(currentUserId)) continue;
            if (otherUser.getSkills() == null) continue;

            
            boolean isReciprocalMatch = false;
            if (otherUser.getInterests() != null) {
                isReciprocalMatch = otherUser.getInterests().stream()
                        .map(i -> normalizeString(i.getId()))
                        .anyMatch(myOfferingIds::contains);
            }

            
            if (!isReciprocalMatch) continue;

            
            boolean isClose = checkLocationMatch(otherUser, myLocation);
            String distanceLabel = isClose ? "Cerca de ti" : "Lejos de ti";

            for (UserSkills skill : otherUser.getSkills()) {
                String skillIdNorm = normalizeString(skill.getId());
                if (myInterestIds.contains(skillIdNorm)) {
                    recommendations.add(mapToCard(otherUser, skill, true, distanceLabel));
                }
            }
        }

       
        recommendations.sort((dto1, dto2) -> {
            boolean c1 = "Cerca de ti".equals(dto1.getDistance());
            boolean c2 = "Cerca de ti".equals(dto2.getDistance());
            return Boolean.compare(c2, c1); 
        });

        return recommendations;
    }

    private boolean checkLocationMatch(User candidate, String myLocation) {
        if (myLocation.isEmpty()) return false;
        if (candidate.getLocation() == null) return false;
        String candidateLoc = normalizeString(candidate.getLocation());
        return candidateLoc.contains(myLocation) || myLocation.contains(candidateLoc);
    }

    private UserSwapDTO mapToCard(User user, UserSkills skill, boolean isMatch, String distanceLabel) {
        UserSwapDTO dto = new UserSwapDTO();
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        
        dto.setSkillName("Clase de " + (skill.getName() != null ? skill.getName() : skill.getId()));     
        dto.setSkillCategory(skill.getCategory());
        dto.setSkillLevel(skill.getLevel());
        dto.setSkillIcon(skill.getIcon() != null ? skill.getIcon() : "🎓");
        
        dto.setDistance(distanceLabel); 
        dto.setRating(5.0);
        dto.setSwapMatch(isMatch); 
        
        return dto;
    }
}