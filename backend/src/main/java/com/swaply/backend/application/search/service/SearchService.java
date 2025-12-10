package com.swaply.backend.application.search.service;

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
public class SearchService {

    private final UserRepository userRepository;

    public SearchService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private String normalizeString(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").trim().toLowerCase();
    }

    public List<UserSwapDTO> searchUsersWithMatch(String query, String myUserId) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        String cleanQuery = normalizeString(query);
        List<User> candidates;

        if (query.contains(",")) {
            List<String> skillIds = Arrays.stream(query.split(","))
                    .map(this::normalizeString)
                    .collect(Collectors.toList());
            candidates = userRepository.findUsersByMultipleSkillIds(skillIds);
        } else {
            candidates = userRepository.findUsersBySingleSkillId(cleanQuery);
        }

        User me = userRepository.findUserById(myUserId).orElse(null);
        
        Set<String> myOfferingIds = new HashSet<>();
        if (me != null && me.getSkills() != null) {
            for (UserSkills s : me.getSkills()) {
                if (s.getId() != null) myOfferingIds.add(normalizeString(s.getId()));
                if (s.getName() != null) myOfferingIds.add(normalizeString(s.getName()));
            }
        }
        
        String myLocation = (me != null && me.getLocation() != null) 
                ? normalizeString(me.getLocation()) : "";

        List<String> searchTerms = query.contains(",") 
                ? Arrays.stream(query.split(",")).map(this::normalizeString).collect(Collectors.toList())
                : List.of(cleanQuery);

        List<UserSwapDTO> results = new ArrayList<>();

        for (User candidate : candidates) {
            if (candidate.getId().equals(myUserId)) continue;
            if (candidate.getSkills() == null) continue;

            boolean isMatch = false;
            if (candidate.getInterests() != null) {
                isMatch = candidate.getInterests().stream().anyMatch(interest -> {
                    String iId = normalizeString(interest.getId());
                    String iName = normalizeString(interest.getName());
                    
                    for (String mySkill : myOfferingIds) {
                        if (iId.equals(mySkill) || iName.equals(mySkill)) return true;
                        if (mySkill.contains(iId) || iId.contains(mySkill)) return true;
                        if (!iName.isEmpty() && (mySkill.contains(iName) || iName.contains(mySkill))) return true;
                    }
                    return false;
                });
            }

            boolean isClose = checkLocationMatch(candidate, myLocation);
            String distanceLabel = isClose ? "Cerca de ti" : "Lejos de ti";

            final boolean finalIsMatch = isMatch;
            
            candidate.getSkills().stream()
                .filter(s -> {
                    String sId = normalizeString(s.getId());
                    String sName = normalizeString(s.getName());
                    return searchTerms.stream().anyMatch(term -> sId.contains(term) || sName.contains(term));
                })
                .forEach(skill -> {
                    results.add(mapToUserSwapDTO(candidate, skill, finalIsMatch, distanceLabel));
                });
        }


        results.sort((o1, o2) -> {
            if (o1.isSwapMatch() != o2.isSwapMatch()) {
                return o1.isSwapMatch() ? -1 : 1;
            }
            boolean loc1 = "Cerca de ti".equals(o1.getDistance());
            boolean loc2 = "Cerca de ti".equals(o2.getDistance());
            
            if (loc1 != loc2) {
                return loc1 ? -1 : 1; 
            }
            
            return Double.compare(o2.getRating(), o1.getRating());
        });

        return results;
    }

    private boolean checkLocationMatch(User candidate, String myLocation) {
        if (myLocation.isEmpty()) return false;
        if (candidate.getLocation() == null) return false;
        
        String candidateLoc = normalizeString(candidate.getLocation());
        
        return candidateLoc.contains(myLocation) || myLocation.contains(candidateLoc);
    }

    private UserSwapDTO mapToUserSwapDTO(User user, UserSkills skill, boolean isMatch, String distanceLabel) {
        UserSwapDTO dto = new UserSwapDTO();
        
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        
        dto.setLocation(user.getLocation()); 
        dto.setRating(user.getRating() != null ? user.getRating() : 5.0); 
        
        dto.setDistance(distanceLabel); 
        dto.setSwapMatch(isMatch);

        String displayName = skill.getName() != null ? skill.getName() : skill.getId();
        if (displayName.length() > 0) {
            displayName = displayName.substring(0, 1).toUpperCase() + displayName.substring(1);
        }
        
        dto.setSkillName("Clase de " + displayName); 
        dto.setSkillIcon(skill.getIcon() != null ? skill.getIcon() : "🎓");
        dto.setSkillCategory(skill.getCategory());
        dto.setSkillLevel(skill.getLevel());

        return dto;
    }
}