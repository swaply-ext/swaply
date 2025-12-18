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
import java.util.stream.Stream;

@Service
public class HomeService {

    private final UserRepository userRepository;

    public HomeService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserSwapDTO> getRecommendedMatches(String currentUserId) {
        User myUser = userRepository.findUserById(currentUserId).orElse(null);

        if (myUser == null || myUser.getInterests() == null || myUser.getInterests().isEmpty()) {
            return List.of();
        }

        
        List<String> myInterestIds = myUser.getInterests().stream()
                .map(s -> normalizeString(s.getId()))
                .collect(Collectors.toList());

        Set<String> myOfferingIds = (myUser.getSkills() != null)
                ? myUser.getSkills().stream().map(s -> normalizeString(s.getId())).collect(Collectors.toSet())
                : Collections.emptySet();

        String myLocation = (myUser.getLocation() != null) ? normalizeString(myUser.getLocation()) : "";

        
        List<User> candidates = userRepository.findUsersByMultipleSkillIds(myInterestIds);

        return candidates.stream()
                .filter(user -> !user.getId().equals(currentUserId)) 
                .filter(user -> user.getSkills() != null)            
                .filter(user -> isReciprocalMatch(user, myOfferingIds)) 
                .flatMap(user -> extractMatchingSkills(user, myInterestIds, myLocation)) 
                .sorted((d1, d2) -> { 
                    
                    boolean c1 = "Cerca de ti".equals(d1.getDistance());
                    boolean c2 = "Cerca de ti".equals(d2.getDistance());
                    return Boolean.compare(c2, c1);
                })
                .collect(Collectors.toList());
    }

    

    private boolean isReciprocalMatch(User otherUser, Set<String> myOfferingIds) {
        if (otherUser.getInterests() == null) return false;
        return otherUser.getInterests().stream()
                .map(i -> normalizeString(i.getId()))
                .anyMatch(myOfferingIds::contains);
    }

    private Stream<UserSwapDTO> extractMatchingSkills(User otherUser, List<String> myInterestIds, String myLocation) {
        boolean isClose = checkLocationMatch(otherUser, myLocation);
        String distanceLabel = isClose ? "Cerca de ti" : "Lejos de ti";

        
        return otherUser.getSkills().stream()
                .filter(skill -> myInterestIds.contains(normalizeString(skill.getId())))
                .map(skill -> mapToCard(otherUser, skill, true, distanceLabel));
    }

    private boolean checkLocationMatch(User candidate, String myLocation) {
        if (myLocation.isEmpty()) return false;
        if (candidate.getLocation() == null) return false;
        String candidateLoc = normalizeString(candidate.getLocation());
        return candidateLoc.contains(myLocation) || myLocation.contains(candidateLoc);
    }

    private String normalizeString(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").toLowerCase().trim();
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