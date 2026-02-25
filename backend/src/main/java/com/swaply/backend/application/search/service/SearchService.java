package com.swaply.backend.application.search.service;

import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.application.search.SearchMapper;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import com.swaply.backend.shared.location.LocationService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class SearchService {

    private final UserRepository userRepository;
    private final LocationService locationService;
    private final SearchMapper searchMapper;

    private static final Map<String, List<String>> SYNONYMS = new HashMap<>();

    static {
        registerSynonyms("football", "futbol", "fútbol", "soccer");
        // ... (resto de tus sinónimos) ...
        registerSynonyms("digital", "ocio digital", "informatica", "gaming", "ordenador");
    }

    public SearchService(UserRepository userRepository, LocationService locationService, SearchMapper searchMapper) {
        this.userRepository = userRepository;
        this.locationService = locationService;
        this.searchMapper = searchMapper;
    }

    public List<UserSwapDTO> searchUsersWithMatch(String query, String myUserId, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        Set<String> searchIds = expandQueryTerms(query);
        User myUser = userRepository.findUserById(myUserId).orElse(null);

        if (myUser == null || myUser.getInterests() == null || myUser.getInterests().isEmpty()) {
            return List.of();
        }

        Map<String, Integer> myInterestLevels = myUser.getInterests().stream()
                .collect(Collectors.toMap(
                        s -> normalizeKey(s.getId()),
                        s -> s.getLevel() != null ? s.getLevel() : 0,
                        (existing, replacement) -> existing));

        Set<String> myOfferingIds = (myUser.getSkills() != null)
                ? myUser.getSkills().stream().map(s -> normalizeKey(s.getId())).collect(Collectors.toSet())
                : Collections.emptySet();

        List<User> candidates = userRepository.findUsersByMultipleSkillIdsList(new ArrayList<>(searchIds));

        List<UserSwapDTO> matches = candidates.parallelStream()
                .filter(user -> !user.getId().equals(myUserId))
                .filter(user -> user.getSkills() != null)
                .filter(user -> isReciprocalMatch(user, myOfferingIds))
                .flatMap(user -> extractMatchingSkills(user, myInterestLevels, myUserId))
                .filter(dto -> searchIds.contains(normalizeKey(dto.getSkillId())))
                .collect(Collectors.toList());

        // ORDENAMIENTO ROBUSTO: Premium -> Distancia
        matches.sort(
            Comparator.comparing(UserSwapDTO::isPremium, Comparator.reverseOrder())
            .thenComparingDouble(this::getNumericDistance)
        );

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), matches.size());

        if (start >= matches.size()) {
            return new ArrayList<>();
        }

        return matches.subList(start, end);
    }

    // Método helper duplicado para parsear distancia (idealmente iría en una clase Utils)
    private double getNumericDistance(UserSwapDTO dto) {
        if (dto.getDistance() == null) return Double.MAX_VALUE;
        try {
            String clean = dto.getDistance().toLowerCase()
                    .replace("km", "")
                    .replace(",", ".")
                    .trim();
            return Double.parseDouble(clean);
        } catch (Exception e) {
            return Double.MAX_VALUE;
        }
    }

    public UserSwapDTO getUserByUsername(String username) {
        return userRepository.findUserByUsername(username)
                .map(searchMapper::toSingleProfileDTO)
                .orElse(null);
    }

    // ... (Mantén el resto de métodos privados igual: expandQueryTerms, extractMatchingSkills, etc.) ...
    
    // Solo asegúrate de incluir el try-catch de distancia en extractMatchingSkills:
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
                    String skillId = normalizeKey(skill.getId());
                    if (!myInterestLevels.containsKey(skillId)) return false;
                    int myLevel = myInterestLevels.get(skillId);
                    int otherLevel = skill.getLevel() != null ? skill.getLevel() : 0;
                    return otherLevel >= myLevel;
                })
                .map(skill -> mapToCard(otherUser, skill, true, finalDistance));
    }
    
    // ... Resto de métodos (isReciprocalMatch, registerSynonyms, etc.) igual que antes
    private boolean isReciprocalMatch(User otherUser, Set<String> myOfferingIds) {
        if (otherUser.getInterests() == null) return false;
        return otherUser.getInterests().stream()
                .map(i -> normalizeKey(i.getId()))
                .anyMatch(myOfferingIds::contains);
    }

    private Set<String> expandQueryTerms(String query) {
        Set<String> expandedTerms = new HashSet<>();
        for (String term : query.split(",")) {
            expandSearchTerm(term).forEach(termVariation -> expandedTerms.add(normalizeKey(termVariation)));
        }
        return expandedTerms;
    }

    private List<String> expandSearchTerm(String term) {
        String normalizedKey = normalizeKey(term);
        List<String> variations = SYNONYMS.getOrDefault(normalizedKey, new ArrayList<>());
        return variations.isEmpty() ? Collections.singletonList(normalizedKey) : variations;
    }

    private static void registerSynonyms(String... terms) {
        List<String> synonymList = Arrays.asList(terms);
        for (String term : terms) {
            SYNONYMS.put(normalizeKey(term), synonymList);
        }
    }

    private static String normalizeKey(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern diacriticsPattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return diacriticsPattern.matcher(normalized).replaceAll("").trim().toLowerCase();
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
        dto.setDistance(distance);
        dto.setRating(5.0);
        dto.setSwapMatch(isMatch);
        return dto;
    }
}