package com.swaply.backend.application.search.service;

import com.swaply.backend.application.search.dto.SkillItemDTO;
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
public class SearchService {

    private final UserRepository userRepository;

    public SearchService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
        // Mapa para guardar los niveles requeridos por mis intereses
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
                    if (interest.getId() != null) {
                        myInterestLevels.put(normalizeKey(interest.getId()), interest.getLevel());
                    }
                    if (interest.getName() != null) {
                         myInterestLevels.put(normalizeKey(interest.getName()), interest.getLevel());
                    }
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
            
            boolean isClose = checkLocationMatch(candidate, myLocation);
            String distanceLabel = isClose ? "Cerca de ti" : "Lejos de ti";
            final boolean finalIsMatch = isMatch;

            candidate.getSkills().stream()
                .filter(skill -> {
                    String sId = normalizeKey(skill.getId());
                    String sName = normalizeKey(skill.getName());
                    
                    boolean idMatch = expandedSearchIds.stream().anyMatch(ex -> sId.equals(ex) || sId.contains(ex));
                    boolean nameMatch = expandedSearchIds.stream().anyMatch(ex -> sName.contains(ex));
                    
                    if (!idMatch && !nameMatch) return false;

                    // --- Lógica de filtrado por Nivel ---
                    int requiredLevel = myInterestLevels.getOrDefault(sId, 0);
                    if (requiredLevel == 0 && !sName.isEmpty()) {
                         requiredLevel = myInterestLevels.getOrDefault(sName, 0);
                    }
                    int teacherLevel = skill.getLevel() != null ? skill.getLevel() : 0;

                    return teacherLevel >= requiredLevel;
                })
                .forEach(skill -> {
                    results.add(mapToUserSwapDTO(candidate, skill, finalIsMatch, distanceLabel));
                });
        }

        results.sort((o1, o2) -> {
            if (o1.isSwapMatch() != o2.isSwapMatch()) return o1.isSwapMatch() ? -1 : 1;
            
            boolean loc1 = "Cerca de ti".equals(o1.getDistance());
            boolean loc2 = "Cerca de ti".equals(o2.getDistance());
            if (loc1 != loc2) return loc1 ? -1 : 1;
            
            return Double.compare(o2.getRating(), o1.getRating());
        });

        return results;
    }

    private boolean checkLocationMatch(User candidate, String myLocation) {
        if (myLocation.isEmpty() || candidate.getLocation() == null) return false;
        String candidateLoc = normalizeKey(candidate.getLocation().getDisplayName());
        return candidateLoc.contains(myLocation) || myLocation.contains(candidateLoc);
    }

    private UserSwapDTO mapToUserSwapDTO(User user, UserSkills skill, boolean isMatch, String distanceLabel) {
        UserSwapDTO dto = new UserSwapDTO();
        
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        
        if (user.getLocation() != null) {
            dto.setLocation(user.getLocation().getDisplayName()); 
        }
        
        dto.setRating(user.getRating() != null ? user.getRating() : 5.0); 
        dto.setDistance(distanceLabel); 
        dto.setSwapMatch(isMatch);

        String rawName = (skill.getName() != null && !skill.getName().isEmpty()) ? skill.getName() : skill.getId();
        String displayName = capitalize(rawName);

        dto.setSkillName("Clase de " + displayName); 
        dto.setSkillIcon(skill.getIcon() != null ? skill.getIcon() : "🎓");
        dto.setSkillCategory(skill.getCategory());
        dto.setSkillLevel(skill.getLevel());

        // Rellenar lista de Skills
        if (user.getSkills() != null) {
            List<SkillItemDTO> allSkills = user.getSkills().stream()
                .map(s -> new SkillItemDTO(
                    s.getName() != null ? s.getName() : s.getId(),
                    s.getCategory(),
                    s.getLevel()
                ))
                .collect(Collectors.toList());
            dto.setUserSkills(allSkills);
        }
        
        // Rellenar lista de Intereses
        if (user.getInterests() != null) {
             List<SkillItemDTO> allInterests = user.getInterests().stream()
                .map(i -> new SkillItemDTO(
                    i.getName() != null ? i.getName() : i.getId(),
                    i.getCategory(),
                    i.getLevel()
                ))
                .collect(Collectors.toList());
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
        
        if (user.getLocation() != null) {
             dto.setLocation(user.getLocation().getDisplayName());
        }

        if (user.getSkills() != null && !user.getSkills().isEmpty()) {
            // Muestra la primera skill como principal para la vista de perfil genérico
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
                    ))
                    .collect(Collectors.toList());

            dto.setUserSkills(allSkills);
        }
        
        if (user.getInterests() != null && !user.getInterests().isEmpty()) {
            List<SkillItemDTO> allInterests = user.getInterests().stream()
                    .map(interest -> new SkillItemDTO(
                            interest.getName() != null ? interest.getName() : interest.getId(),
                            interest.getCategory(),
                            interest.getLevel()
                    ))
                    .collect(Collectors.toList());

            dto.setInterests(allInterests);
        }

        dto.setRating(4.8);
        dto.setDistance("Cerca de ti");
        dto.setSwapMatch(false);

        return dto;
    }
}