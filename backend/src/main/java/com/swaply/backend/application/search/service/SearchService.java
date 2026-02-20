package com.swaply.backend.application.search.service;

import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.shared.UserCRUD.Model.Skills;
import com.swaply.backend.application.search.SearchMapper;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import com.swaply.backend.shared.location.LocationService;
import org.springframework.stereotype.Service;

import com.swaply.backend.application.skills.SkillsMapper;
import com.swaply.backend.application.skills.dto.SkillDisplayDTO;
import com.swaply.backend.application.skills.service.SkillsService;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class SearchService {

    private final UserRepository userRepository;
    private final SkillsService skillsService;
    private final SkillsMapper skillsMapper;
    private final LocationService locationService;
    private final SearchMapper searchMapper;

    public SearchService(UserRepository userRepository, SkillsService skillsService, SkillsMapper skillsMapper) {
        this.userRepository = userRepository;
        this.skillsService = skillsService;
        this.skillsMapper = skillsMapper;
    }

    private static final Map<String, List<String>> SYNONYMS = new HashMap<>();

    static {
        addSynonyms("football", "futbol", "fútbol", "soccer");
        addSynonyms("basketball", "basquet", "básquet", "baloncesto", "basket");
        addSynonyms("padel", "pádel", "paddle");
        addSynonyms("volleyball", "voley", "vóley", "voleibol");
        addSynonyms("boxing", "boxeo", "box");

        addSynonyms("guitar", "guitarra");
        addSynonyms("piano", "teclado");
        addSynonyms("violin", "violín");
        addSynonyms("drums", "bateria", "batería", "percusion");
        addSynonyms("saxophone", "saxofon", "saxofón", "saxo");

        addSynonyms("drawing", "dibujo", "pintura", "arte");
        addSynonyms("cooking", "cocina", "gastronomia", "culinaria");
        addSynonyms("dance", "baile", "danza", "dancing");
        addSynonyms("crafts", "manualidades", "artesania", "bricolaje");
        addSynonyms("digital", "ocio digital", "informatica", "gaming", "ordenador");
    }

    private static void addSynonyms(String... terms) {
        List<String> list = Arrays.asList(terms);
        for (String term : terms) {
            SYNONYMS.put(normalizeKey(term), list);
        }
    }

    private static String normalizeKey(String input) {
        if (input == null)
            return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").trim().toLowerCase();
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

        String myLocation = (me != null && me.getLocation() != null)
                ? normalizeKey(me.getLocation().getDisplayName())
                : "";

        List<UserSwapDTO> searchResults = new ArrayList<>();

        for (User candidate : candidates) {
            if (candidate.getId().equals(myUserId))
                continue;
            if (candidate.getSkills() == null)
                continue;

            boolean isSwapMatch = calculateSwapMatch(candidate, myOfferingTokens);
            String distanceString = calculateDistanceSafe(myUserId, candidate.getUsername());

            candidate.getSkills().stream()
                    .filter(userSkill -> {
                        if (me == null || me.getInterests() == null)
                            return false;

                        Skills skill = skillsService.getSkill(userSkill.getId());

                        String skillKey = normalizeKey(skill.getName() != null ? skill.getName() : skill.getId());
                        Integer skillLevel = userSkill.getLevel() != null ? userSkill.getLevel() : 0;

                        for (UserSkills myInterest : me.getInterests()) {
                            String interestKey = normalizeKey(
                                    myInterest.getId());
                            Integer interestLevel = myInterest.getLevel() != null ? myInterest.getLevel() : 0;

                            if (sameSkill && levelOk)
                                return true;
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

        // Ordenamos primero por match, luego cercanía, luego rating
        results.sort((o1, o2) -> {
            if (o1.isSwapMatch() != o2.isSwapMatch())
                return o1.isSwapMatch() ? -1 : 1;

            boolean loc1 = "Cerca de ti".equals(o1.getDistance());
            boolean loc2 = "Cerca de ti".equals(o2.getDistance());
            if (loc1 != loc2)
                return loc1 ? -1 : 1;
          
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

    private boolean checkLocationMatch(User candidate, String myLocation) {
        if (myLocation.isEmpty() || candidate.getLocation() == null)
            return false;
        String candidateLoc = normalizeKey(candidate.getLocation().getDisplayName());
        return candidateLoc.contains(myLocation) || myLocation.contains(candidateLoc);
    }

    private UserSwapDTO mapToUserSwapDTO(User user, UserSkills userSkill, boolean isMatch, String distanceLabel) {
        UserSwapDTO dto = new UserSwapDTO();
        Skills skill = skillsService.getSkill(userSkill.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());

        // Manejo seguro de Location para evitar NullPointerException
        if (user.getLocation() != null) {
            dto.setLocation(user.getLocation().getDisplayName());
        }

        dto.setRating(user.getRating() != null ? user.getRating() : 5.0);
        dto.setDistance(distanceLabel);
        dto.setSwapMatch(isMatch);
        
        SkillDisplayDTO skillDisplay = skillsMapper.toDisplayDTO(skill, userSkill);
        dto.setSkill(skillDisplay);
        return dto;
    }

    public UserSwapDTO getUserByUsername(String username) {
        Optional<User> userOpt = userRepository.findUserByUsername(username);
        if (userOpt.isEmpty())
            return null;

        User user = userOpt.get();
        UserSwapDTO dto = new UserSwapDTO();
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());

        if (user.getLocation() != null) {
            dto.setLocation(user.getLocation().getDisplayName());
        }
    }

        if (user.getSkills() != null && !user.getSkills().isEmpty()) {
            UserSkills userSkill = user.getSkills().get(0);
            Skills skill = skillsService.getSkill(userSkill.getId());

            dto.setSkill(skillsMapper.toDisplayDTO(skill, userSkill));

            dto.setUserSkills(user.getSkills());
        }

        if (user.getInterests() != null && !user.getInterests().isEmpty()) {

            dto.setInterests(user.getInterests());
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