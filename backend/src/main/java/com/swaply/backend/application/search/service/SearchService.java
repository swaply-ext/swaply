package com.swaply.backend.application.search.service;

import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.application.search.SearchMapper;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import com.swaply.backend.shared.location.LocationService;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class SearchService {

    private final UserRepository userRepository;
    private final LocationService locationService;
    private final SearchMapper searchMapper;

    private static final Map<String, List<String>> SYNONYMS = new HashMap<>();

    static {
        registerSynonyms("football", "futbol", "fútbol", "soccer");
        registerSynonyms("basketball", "basquet", "básquet", "baloncesto", "basket");
        registerSynonyms("padel", "pádel", "paddle");
        registerSynonyms("volleyball", "voley", "vóley", "voleibol");
        registerSynonyms("boxing", "boxeo", "box");
        registerSynonyms("guitar", "guitarra");
        registerSynonyms("piano", "teclado");
        registerSynonyms("violin", "violín");
        registerSynonyms("drums", "bateria", "batería", "percusion");
        registerSynonyms("saxophone", "saxofon", "saxofón", "saxo");
        registerSynonyms("drawing", "dibujo", "pintura", "arte");
        registerSynonyms("cooking", "cocina", "gastronomia", "culinaria");
        registerSynonyms("dance", "baile", "danza", "dancing");
        registerSynonyms("crafts", "manualidades", "artesania", "bricolaje");
        registerSynonyms("digital", "ocio digital", "informatica", "gaming", "ordenador");
    }

    public SearchService(UserRepository userRepository, LocationService locationService, SearchMapper searchMapper) {
        this.userRepository = userRepository;
        this.locationService = locationService;
        this.searchMapper = searchMapper;
    }

    public List<UserSwapDTO> searchUsersWithMatch(String query, String myUserId) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        Set<String> searchIds = expandQueryTerms(query);

        List<User> candidates = userRepository.findUsersByMultipleSkillIds(new ArrayList<>(searchIds));
        User currentUser = userRepository.findUserById(myUserId).orElse(null);

        Set<String> myOfferingTokens = extractMyOfferingTokens(currentUser);
        Map<String, Integer> myInterestLevels = extractMyInterestLevels(currentUser);

        List<UserSwapDTO> searchResults = new ArrayList<>();

        for (User candidate : candidates) {
            if (shouldSkipCandidate(candidate, myUserId)) continue;

            boolean isSwapMatch = calculateSwapMatch(candidate, myOfferingTokens);
            String distanceString = calculateDistanceSafe(myUserId, candidate.getUsername());

            candidate.getSkills().stream()
                .filter(skill -> isSkillRelevant(skill, searchIds, myInterestLevels))
                .forEach(skill -> {
                    searchResults.add(searchMapper.toDTO(candidate, skill, isSwapMatch, distanceString));
                });
        }

        sortResults(searchResults);

        return searchResults;
    }

    public UserSwapDTO getUserByUsername(String username) {
        return userRepository.findUserByUsername(username)
                .map(searchMapper::toSingleProfileDTO)
                .orElse(null);
    }


    private boolean shouldSkipCandidate(User candidate, String myUserId) {
        return candidate.getId().equals(myUserId) || candidate.getSkills() == null;
    }

    private Set<String> expandQueryTerms(String query) {
        Set<String> expandedTerms = new HashSet<>();
        for (String term : query.split(",")) {
            expandSearchTerm(term).forEach(termVariation -> expandedTerms.add(normalizeKey(termVariation)));
        }
        return expandedTerms;
    }

    private Set<String> extractMyOfferingTokens(User user) {
        Set<String> tokens = new HashSet<>();
        if (user != null && user.getSkills() != null) {
            for (UserSkills skill : user.getSkills()) {
                if (skill.getId() != null) tokens.add(normalizeKey(skill.getId()));
                if (skill.getName() != null) tokens.add(normalizeKey(skill.getName()));
            }
        }
        return tokens;
    }

    private Map<String, Integer> extractMyInterestLevels(User user) {
        Map<String, Integer> levels = new HashMap<>();
        if (user != null && user.getInterests() != null) {
            for (UserSkills interest : user.getInterests()) {
                if (interest.getId() != null) levels.put(normalizeKey(interest.getId()), interest.getLevel());
                if (interest.getName() != null) levels.put(normalizeKey(interest.getName()), interest.getLevel());
            }
        }
        return levels;
    }


    private boolean calculateSwapMatch(User candidate, Set<String> myOfferingTokens) {
        if (candidate.getInterests() == null || myOfferingTokens.isEmpty()) {
            return false;
        }

        return candidate.getInterests().stream().anyMatch(interest -> {
            String candidateInterestId = normalizeKey(interest.getId());
            String candidateInterestName = normalizeKey(interest.getName());

            for (String myToken : myOfferingTokens) {
                if (containsMatch(myToken, candidateInterestId) || 
                   (!candidateInterestName.isEmpty() && containsMatch(myToken, candidateInterestName))) {
                    return true;
                }
                
                List<String> myTokenSynonyms = expandSearchTerm(myToken);
                if (myTokenSynonyms.contains(candidateInterestId)) return true;
            }
            return false;
        });
    }

    private boolean containsMatch(String valueA, String valueB) {
        return valueA.contains(valueB) || valueB.contains(valueA);
    }

    private boolean isSkillRelevant(UserSkills candidateSkill, Set<String> searchIds, Map<String, Integer> myInterestLevels) {
        String skillId = normalizeKey(candidateSkill.getId());
        String skillName = normalizeKey(candidateSkill.getName());

        boolean idMatch = searchIds.stream()
                .anyMatch(searchTerm -> skillId.equals(searchTerm) || skillId.contains(searchTerm));
        
        boolean nameMatch = searchIds.stream()
                .anyMatch(searchTerm -> skillName.contains(searchTerm));

        if (!idMatch && !nameMatch) return false;

        int requiredLevel = myInterestLevels.getOrDefault(skillId, 0);
        if (requiredLevel == 0 && !skillName.isEmpty()) {
            requiredLevel = myInterestLevels.getOrDefault(skillName, 0);
        }
        int teacherLevel = candidateSkill.getLevel() != null ? candidateSkill.getLevel() : 0;

        return teacherLevel >= requiredLevel;
    }

    private String calculateDistanceSafe(String myUserId, String targetUsername) {
        try {
            return locationService.calculateDistance(myUserId, targetUsername);
        } catch (Exception e) {
            return null; 
        }
    }

    private void sortResults(List<UserSwapDTO> results) {
        results.sort((result1, result2) -> {
            if (result1.isSwapMatch() && !result2.isSwapMatch()) return -1;
            if (!result1.isSwapMatch() && result2.isSwapMatch()) return 1;

            double distanceValue1 = parseDistance(result1.getDistance());
            double distanceValue2 = parseDistance(result2.getDistance());
            
            int distanceComparison = Double.compare(distanceValue1, distanceValue2);
            if (distanceComparison != 0) return distanceComparison;


            double rating1 = result1.getRating() != null ? result1.getRating() : 0.0;
            double rating2 = result2.getRating() != null ? result2.getRating() : 0.0;
            
            return Double.compare(rating2, rating1);
        });
    }

    private double parseDistance(String distanceString) {
        if (distanceString == null || distanceString.trim().isEmpty()) return Double.MAX_VALUE;
        try {
            String cleanDistance = distanceString.replaceAll("[^0-9.,]", "").replace(",", ".");
            if (cleanDistance.isEmpty()) return Double.MAX_VALUE;
            return Double.parseDouble(cleanDistance);
        } catch (NumberFormatException e) {
            return Double.MAX_VALUE;
        }
    }



    private static void registerSynonyms(String... terms) {
        List<String> synonymList = Arrays.asList(terms);
        for (String term : terms) {
            SYNONYMS.put(normalizeKey(term), synonymList);
        }
    }

    private List<String> expandSearchTerm(String term) {
        String normalizedKey = normalizeKey(term);
        List<String> variations = SYNONYMS.getOrDefault(normalizedKey, new ArrayList<>());
        return variations.isEmpty() ? Collections.singletonList(normalizedKey) : variations;
    }

    private static String normalizeKey(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern diacriticsPattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return diacriticsPattern.matcher(normalized).replaceAll("").trim().toLowerCase();
    }
}