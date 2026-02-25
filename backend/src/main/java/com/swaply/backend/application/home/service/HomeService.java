package com.swaply.backend.application.home.service;

import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.swaply.backend.shared.location.LocationService;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class HomeService {

    private final UserRepository userRepository;
    private final LocationService locationService;

    public HomeService(UserRepository userRepository, LocationService locationService) {
        this.userRepository = userRepository;
        this.locationService = locationService;
    }

    public List<UserSwapDTO> getRecommendedMatches(String currentUserId, Pageable pageable) {
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

        // 1. Obtener candidatos (Recuerda tener TOP 100 en tu query SQL si es posible)
        List<User> candidates = userRepository.findUsersByMultipleSkillIdsList(myInterestIds);

        // 2. Procesar en paralelo
        List<UserSwapDTO> matches = candidates.parallelStream()
                .filter(user -> !user.getId().equals(currentUserId))
                .filter(user -> user.getSkills() != null)
                .filter(user -> isReciprocalMatch(user, myOfferingIds))
                .flatMap(user -> extractMatchingSkills(user, myInterestLevels, currentUserId))
                .collect(Collectors.toList());

        // 3. Ordenar: Premium primero, luego Distancia
        matches.sort(
            Comparator.comparing(UserSwapDTO::isPremium, Comparator.reverseOrder()) // true va antes que false
            .thenComparingDouble(this::getNumericDistance) // menor distancia primero
        );

        // 4. Paginación manual
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), matches.size());

        if (start >= matches.size()) {
            return new ArrayList<>();
        }

        return matches.subList(start, end);
    }

    // --- HELPER PARA LIMPIAR DISTANCIA ---
    // Convierte "12.5 km", "12,5", "Lejos" en un número Double ordenable
    private double getNumericDistance(UserSwapDTO dto) {
        if (dto.getDistance() == null) return Double.MAX_VALUE;
        try {
            // Quitamos "km", espacios y cambiamos coma por punto
            String clean = dto.getDistance().toLowerCase()
                    .replace("km", "")
                    .replace(",", ".")
                    .trim();
            return Double.parseDouble(clean);
        } catch (Exception e) {
            return Double.MAX_VALUE; // Si falla, lo mandamos al final
        }
    }

    private boolean isReciprocalMatch(User otherUser, Set<String> myOfferingIds) {
        if (otherUser.getInterests() == null) return false;
        return otherUser.getInterests().stream()
                .map(i -> normalizeString(i.getId()))
                .anyMatch(myOfferingIds::contains);
    }

    private Stream<UserSwapDTO> extractMatchingSkills(User otherUser, Map<String, Integer> myInterestLevels, String currentUserId) {
        String distance;
        try {
            distance = locationService.calculateDistance(currentUserId, otherUser.getUsername());
        } catch (Exception e) {
            distance = null;
        }
        
        String finalDistance = distance;

        return otherUser.getSkills().stream()
                .filter(skill -> {
                    String skillId = normalizeString(skill.getId());
                    if (!myInterestLevels.containsKey(skillId)) return false;
                    int myLevel = myInterestLevels.get(skillId);
                    int otherLevel = skill.getLevel() != null ? skill.getLevel() : 0;
                    return otherLevel >= myLevel;
                })
                .map(skill -> mapToCard(otherUser, skill, true, finalDistance));
    }

    private String normalizeString(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").toLowerCase().trim();
    }

    private UserSwapDTO mapToCard(User user, UserSkills skill, boolean isMatch, String distance) {
        UserSwapDTO dto = new UserSwapDTO();
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        dto.setPremium(user.isPremium());
        dto.setSkillId(skill.getId());
        dto.setSkillName("Clase de " + (skill.getName() != null ? skill.getName() : skill.getId()));
        dto.setSkillCategory(skill.getCategory());
        dto.setSkillLevel(skill.getLevel());
        dto.setSkillIcon(skill.getIcon() != null ? skill.getIcon() : "🎓");
        dto.setDistance(distance); // Guardamos el string tal cual viene
        dto.setRating(5.0);
        dto.setSwapMatch(isMatch);
        return dto;
    }
}