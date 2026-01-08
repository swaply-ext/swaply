package com.swaply.backend.application.home.service;

import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.shared.UserCRUD.Model.Skills;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import org.springframework.stereotype.Service;
import com.swaply.backend.shared.location.LocationService;
import com.swaply.backend.application.skills.service.SkillsService;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class HomeService {

    private final UserRepository userRepository;
    private final LocationService locationService;
    private final SkillsService skillsService;

    public HomeService(UserRepository userRepository, LocationService locationService, SkillsService skillsService) {
        this.userRepository = userRepository;
        this.locationService = locationService;
        this.skillsService = skillsService;
    }

    public List<UserSwapDTO> getRecommendedMatches(String currentUserId) {
        User myUser = userRepository.findUserById(currentUserId).orElse(null);

        if (myUser == null || myUser.getInterests() == null || myUser.getInterests().isEmpty()) {
            return List.of();
        }

        Map<String, Integer> myInterestLevels = myUser.getInterests().stream()
                .collect(Collectors.toMap(
                        s -> normalizeString(s.getId()),
                        s -> s.getLevel() != null ? s.getLevel() : 0,
                        (existing, replacement) -> existing));

        List<String> myInterestIds = new ArrayList<>(myInterestLevels.keySet());

        Set<String> myOfferingIds = (myUser.getSkills() != null)
                ? myUser.getSkills().stream().map(s -> normalizeString(s.getId())).collect(Collectors.toSet())
                : Collections.emptySet();

        List<User> candidates = userRepository.findUsersByMultipleSkillIds(myInterestIds);

        return candidates.stream()
                .filter(user -> !user.getId().equals(currentUserId)) 
                .filter(user -> user.getSkills() != null)            
                .filter(user -> isReciprocalMatch(user, myOfferingIds)) 
                .flatMap(user -> extractMatchingSkills(user, myInterestLevels, currentUserId)) 
                .sorted(Comparator.comparingDouble(d -> {
                    try {
                        return d.getDistance() != null ? Double.parseDouble(d.getDistance()) : Double.MAX_VALUE;
                    } catch (NumberFormatException e) {
                        return Double.MAX_VALUE;
                    }
                }))
                .collect(Collectors.toList());
    }

    

    private boolean isReciprocalMatch(User otherUser, Set<String> myOfferingIds) {
        if (otherUser.getInterests() == null) return false;
        return otherUser.getInterests().stream()
                .map(i -> normalizeString(i.getId()))
                .anyMatch(myOfferingIds::contains);
    }

    private Stream<UserSwapDTO> extractMatchingSkills(User otherUser, Map<String, Integer> myInterestLevels, String currentUserId) {
        String distance = locationService.calculateDistance(currentUserId, otherUser.getUsername());
        
        return otherUser.getSkills().stream()
                .filter(skill -> {
                    String skillId = normalizeString(skill.getId());
                    if (!myInterestLevels.containsKey(skillId)) return false;
                    int myLevel = myInterestLevels.get(skillId);
                    int otherLevel = skill.getLevel() != null ? skill.getLevel() : 0;
                    return otherLevel >= myLevel;
                })
                .map(skill -> mapToCard(otherUser, skill, true, distance));
    }

    private String normalizeString(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").toLowerCase().trim();
    }

    private UserSwapDTO mapToCard(User user, UserSkills userSkill, boolean isMatch, String distance) {
        Skills skill =  skillsService.getSkill(userSkill.getId());
        UserSwapDTO dto = new UserSwapDTO();
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());

        dto.setSkillName("Clase de " + (skill.getName() != null ? skill.getName() : skill.getId()));
        dto.setSkillCategory(skill.getCategory());
        dto.setSkillLevel(userSkill.getLevel());
        dto.setSkillIcon(skill.getIcon() != null ? skill.getIcon() : "🎓");

        dto.setDistance(distance != null ? String.valueOf(distance) : null);
        dto.setRating(5.0);
        dto.setSwapMatch(isMatch);

        return dto;
    }
}