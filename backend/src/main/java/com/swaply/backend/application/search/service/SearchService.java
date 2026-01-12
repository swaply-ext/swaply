package com.swaply.backend.application.search.service;

import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.shared.UserCRUD.Model.Skills;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import com.swaply.backend.shared.UserCRUD.UserRepository;

import org.springframework.stereotype.Service;

import com.swaply.backend.application.skills.SkillDisplayDTO;
import com.swaply.backend.application.skills.SkillsMapper;
import com.swaply.backend.application.skills.service.SkillsService;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class SearchService {

    private final UserRepository userRepository;
    private final SkillsService skillsService;
    private final SkillsMapper skillsMapper;

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

    private List<String> expandSearchTerm(String term) {
        String key = normalizeKey(term);
        List<String> variations = SYNONYMS.getOrDefault(key, new ArrayList<>());
        if (variations.isEmpty()) {
            return Collections.singletonList(key);
        }
        return variations;
    }

    public List<UserSwapDTO> searchUsersWithMatch(String query, String myUserId) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        Set<String> expandedSearchIds = new HashSet<>();
        String[] rawTerms = query.split(",");

        for (String term : rawTerms) {
            List<String> expansions = expandSearchTerm(term);
            expansions.forEach(e -> expandedSearchIds.add(normalizeKey(e)));
        }

        List<User> candidates = userRepository.findUsersByMultipleSkillIds(new ArrayList<>(expandedSearchIds));
        User me = userRepository.findUserById(myUserId).orElse(null);

        String myLocation = (me != null && me.getLocation() != null)
                ? normalizeKey(me.getLocation().getDisplayName())
                : "";

        List<UserSwapDTO> results = new ArrayList<>();

        for (User candidate : candidates) {
            if (candidate.getId().equals(myUserId))
                continue;
            if (candidate.getSkills() == null)
                continue;

            boolean isClose = checkLocationMatch(candidate, myLocation);
            String distanceLabel = isClose ? "Cerca de ti" : "Lejos de ti";

            // Filtrar skills según intereses y nivel
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

                            boolean sameSkill = skillKey.contains(interestKey) || interestKey.contains(skillKey);
                            boolean levelOk = skillLevel >= interestLevel;

                            if (sameSkill && levelOk)
                                return true;
                        }

                        return false;
                    })
                    .forEach(skill -> {
                        results.add(mapToUserSwapDTO(candidate, skill, true, distanceLabel));
                    });
        }

        // Ordenamos primero por match, luego cercanía, luego rating
        results.sort((o1, o2) -> {
            if (o1.isSwapMatch() != o2.isSwapMatch())
                return o1.isSwapMatch() ? -1 : 1;

            boolean loc1 = "Cerca de ti".equals(o1.getDistance());
            boolean loc2 = "Cerca de ti".equals(o2.getDistance());
            if (loc1 != loc2)
                return loc1 ? -1 : 1;

            return Double.compare(o2.getRating(), o1.getRating());
        });

        return results;
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
        dto.setUserId(user.getId());
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
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());

        if (user.getLocation() != null) {
            dto.setLocation(user.getLocation().getDisplayName());
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

        dto.setRating(4.8);
        dto.setDistance("Cerca de ti");
        dto.setSwapMatch(false);

        return dto;
    }
}