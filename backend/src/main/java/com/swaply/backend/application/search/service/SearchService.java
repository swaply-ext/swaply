package com.swaply.backend.application.search.service;

import com.swaply.backend.application.search.dto.SkillItemDTO;
import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.Model.UserSkills;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import com.swaply.backend.shared.location.LocationService;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final UserRepository userRepository;
    private final LocationService locationService;

    public SearchService(UserRepository userRepository, LocationService locationService) {
        this.userRepository = userRepository;
        this.locationService = locationService;
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
        if (input == null) return "";
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
        
        Set<String> myOfferingTokens = new HashSet<>();
        Map<String, Integer> myInterestLevels = new HashMap<>();

        if (me != null) {
            if (me.getSkills() != null) {
                for (UserSkills s : me.getSkills()) {
                    if (s.getId() != null) myOfferingTokens.add(normalizeKey(s.getId()));
                    if (s.getName() != null) myOfferingTokens.add(normalizeKey(s.getName()));
                }
            }
            if (me.getInterests() != null) {
                for (UserSkills interest : me.getInterests()) {
                    if (interest.getId() != null) myInterestLevels.put(normalizeKey(interest.getId()), interest.getLevel());
                    if (interest.getName() != null) myInterestLevels.put(normalizeKey(interest.getName()), interest.getLevel());
                }
            }
        }
        
        String myLocation = (me != null && me.getLocation() != null) 
                ? normalizeKey(me.getLocation().getDisplayName()) : "";

        List<UserSwapDTO> results = new ArrayList<>();

        for (User candidate : candidates) {
            if (candidate.getId().equals(myUserId)) continue;
            if (candidate.getSkills() == null) continue;

            boolean isMatch = false;
            if (candidate.getInterests() != null && !myOfferingTokens.isEmpty()) {
                isMatch = candidate.getInterests().stream().anyMatch(interest -> {
                    String iId = normalizeKey(interest.getId());
                    String iName = normalizeKey(interest.getName());
                    for (String myToken : myOfferingTokens) {
                        if (myToken.contains(iId) || iId.contains(myToken)) return true;
                        if (!iName.isEmpty() && (myToken.contains(iName) || iName.contains(myToken))) return true;
                        List<String> myTokenSynonyms = expandSearchTerm(myToken);
                        if (myTokenSynonyms.contains(iId)) return true;
                    }
                    return false;
                });
            }
            
            String distanceStr = null;
            try {
                distanceStr = locationService.calculateDistance(myUserId, candidate.getUsername());
            } catch (Exception e) {
            }
            
            final boolean finalIsMatch = isMatch;
            final String finalDistanceStr = distanceStr;

            candidate.getSkills().stream()
                .filter(skill -> {
                    String sId = normalizeKey(skill.getId());
                    String sName = normalizeKey(skill.getName());
                    
                    boolean idMatch = expandedSearchIds.stream().anyMatch(ex -> sId.equals(ex) || sId.contains(ex));
                    boolean nameMatch = expandedSearchIds.stream().anyMatch(ex -> sName.contains(ex));
                    
                    if (!idMatch && !nameMatch) return false;

                    int requiredLevel = myInterestLevels.getOrDefault(sId, 0);
                    if (requiredLevel == 0 && !sName.isEmpty()) requiredLevel = myInterestLevels.getOrDefault(sName, 0);
                    int teacherLevel = skill.getLevel() != null ? skill.getLevel() : 0;

                    return teacherLevel >= requiredLevel;
                })
                .forEach(skill -> {
                    results.add(mapToUserSwapDTO(candidate, skill, finalIsMatch, finalDistanceStr));
                });
        }

        results.sort((o1, o2) -> {
            if (o1.isSwapMatch() && !o2.isSwapMatch()) return -1;
            if (!o1.isSwapMatch() && o2.isSwapMatch()) return 1;
            
            double d1 = parseDistance(o1.getDistance());
            double d2 = parseDistance(o2.getDistance());
            
            int distCompare = Double.compare(d1, d2);
            if (distCompare != 0) return distCompare;

            double r1 = o1.getRating() != null ? o1.getRating() : 0.0;
            double r2 = o2.getRating() != null ? o2.getRating() : 0.0;
            return Double.compare(r2, r1);
        });

        return results;
    }

    private double parseDistance(String distStr) {
        if (distStr == null || distStr.trim().isEmpty()) return Double.MAX_VALUE;
        try {

            String clean = distStr.replaceAll("[^0-9.,]", "").replace(",", ".");
            if (clean.isEmpty()) return Double.MAX_VALUE;
            return Double.parseDouble(clean);
        } catch (NumberFormatException e) {
            return Double.MAX_VALUE;
        }
    }

    private UserSwapDTO mapToUserSwapDTO(User user, UserSkills skill, boolean isMatch, String distance) {
        UserSwapDTO dto = new UserSwapDTO();
        
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        
        if (user.getLocation() != null) {
            dto.setLocation(user.getLocation().getDisplayName()); 
        }
        
        dto.setRating(user.getRating() != null ? user.getRating() : 5.0); 
        dto.setDistance(distance); 
        dto.setSwapMatch(isMatch);

        String rawName = (skill.getName() != null && !skill.getName().isEmpty()) ? skill.getName() : skill.getId();
        String displayName = capitalize(rawName);

        dto.setSkillName("Clase de " + displayName); 
        dto.setSkillIcon(skill.getIcon() != null ? skill.getIcon() : "🎓");
        dto.setSkillCategory(skill.getCategory());
        dto.setSkillLevel(skill.getLevel());

        if (user.getSkills() != null) {
            List<SkillItemDTO> allSkills = user.getSkills().stream()
                .map(s -> new SkillItemDTO(
                    s.getName() != null ? s.getName() : s.getId(),
                    s.getCategory(),
                    s.getLevel()
                )).collect(Collectors.toList());
            dto.setUserSkills(allSkills);
        }
        
        if (user.getInterests() != null) {
             List<SkillItemDTO> allInterests = user.getInterests().stream()
                .map(i -> new SkillItemDTO(
                    i.getName() != null ? i.getName() : i.getId(),
                    i.getCategory(),
                    i.getLevel()
                )).collect(Collectors.toList());
            dto.setInterests(allInterests);
        }

        return dto;
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    public UserSwapDTO getUserByUsername(String username) {
        Optional<User> userOpt = userRepository.findUserByUsername(username);

        if (userOpt.isEmpty()) {
            return null;
        }

        User user = userOpt.get();

        UserSwapDTO dto = new UserSwapDTO();
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        
        if (user.getLocation() != null) dto.setLocation(user.getLocation().getDisplayName());

        if (user.getSkills() != null && !user.getSkills().isEmpty()) {
            UserSkills s = user.getSkills().get(0);
            dto.setSkillName(s.getName() != null ? s.getName() : s.getId());
            dto.setSkillIcon(s.getIcon() != null ? s.getIcon() : "🎓");
            dto.setSkillLevel(s.getLevel());
            dto.setSkillCategory(s.getCategory());

            List<SkillItemDTO> allSkills = user.getSkills().stream()
                    .map(skill -> new SkillItemDTO(
                            skill.getName() != null ? skill.getName() : skill.getId(),
                            skill.getCategory(),
                            skill.getLevel()
                    )).collect(Collectors.toList());
            dto.setUserSkills(allSkills);
        }
        
        if (user.getInterests() != null && !user.getInterests().isEmpty()) {
            List<SkillItemDTO> allInterests = user.getInterests().stream()
                    .map(interest -> new SkillItemDTO(
                            interest.getName() != null ? interest.getName() : interest.getId(),
                            interest.getCategory(),
                            interest.getLevel()
                    )).collect(Collectors.toList());
            dto.setInterests(allInterests);
        }

        dto.setRating(4.8);
        dto.setDistance("Cerca de ti");
        dto.setSwapMatch(false);

        return dto;
    }
}