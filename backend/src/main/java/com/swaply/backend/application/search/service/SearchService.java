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

    // --- MAPA DE EXPANSIÓN (SINÓNIMOS) ---
    // Esto resuelve el problema de no saber si el ID es 'football' o 'futbol'.
    // Buscaremos por TODAS las variantes.
    private static final Map<String, List<String>> SYNONYMS = new HashMap<>();

    static {
        // Deportes
        addSynonyms("football", "futbol", "fútbol", "soccer");
        addSynonyms("basketball", "basquet", "básquet", "baloncesto", "basket");
        addSynonyms("padel", "pádel", "paddle");
        addSynonyms("volleyball", "voley", "vóley", "voleibol");
        addSynonyms("boxing", "boxeo", "box");

        // Música
        addSynonyms("guitar", "guitarra");
        addSynonyms("piano", "teclado");
        addSynonyms("violin", "violín");
        addSynonyms("drums", "bateria", "batería", "percusion");
        addSynonyms("saxophone", "saxofon", "saxofón", "saxo");

        // Ocio
        addSynonyms("drawing", "dibujo", "pintura", "arte");
        addSynonyms("cooking", "cocina", "gastronomia", "culinaria");
        addSynonyms("dance", "baile", "danza", "dancing");
        addSynonyms("crafts", "manualidades", "artesania", "bricolaje");
        addSynonyms("digital", "ocio digital", "informatica", "gaming", "ordenador");
    }

    // Método helper para llenar el mapa bidireccionalmente
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

    // Dada una palabra (ej: "futbol"), devuelve ["futbol", "football", "soccer", "fútbol"]
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

        // 1. PREPARAR TÉRMINOS DE BÚSQUEDA EXPANDIDOS
        // Si buscas "futbol,guitarra", generamos una lista gigante con todos los sinónimos de ambos.
        Set<String> expandedSearchIds = new HashSet<>();
        String[] rawTerms = query.split(",");
        
        for (String term : rawTerms) {
            List<String> expansions = expandSearchTerm(term);
            // Normalizamos cada variante para asegurar coincidencia con BD
            expansions.forEach(e -> expandedSearchIds.add(normalizeKey(e)));
        }

        // 2. BUSQUEDA EN BASE DE DATOS
        // Buscamos usuarios que tengan CUALQUIERA de los IDs expandidos
        List<User> candidates = userRepository.findUsersByMultipleSkillIds(new ArrayList<>(expandedSearchIds));

        User me = userRepository.findUserById(myUserId).orElse(null);
        
        // Mis habilidades para el Match
        Set<String> myOfferingTokens = new HashSet<>();
        if (me != null && me.getSkills() != null) {
            for (UserSkills s : me.getSkills()) {
                if (s.getId() != null) myOfferingTokens.add(normalizeKey(s.getId()));
                if (s.getName() != null) myOfferingTokens.add(normalizeKey(s.getName()));
            }
        }
        
        String myLocation = (me != null && me.getLocation() != null) 
                ? normalizeKey(me.getLocation()) : "";

        List<UserSwapDTO> results = new ArrayList<>();

        // 3. PROCESAMIENTO
        for (User candidate : candidates) {
            if (candidate.getId().equals(myUserId)) continue;
            if (candidate.getSkills() == null) continue;

            // A. CHECK MATCH
            boolean isMatch = false;
            if (candidate.getInterests() != null && !myOfferingTokens.isEmpty()) {
                isMatch = candidate.getInterests().stream().anyMatch(interest -> {
                    String iId = normalizeKey(interest.getId());
                    String iName = normalizeKey(interest.getName());
                    
                    for (String myToken : myOfferingTokens) {
                        // Coincidencia directa o cruzada
                        if (myToken.contains(iId) || iId.contains(myToken)) return true;
                        if (!iName.isEmpty() && (myToken.contains(iName) || iName.contains(myToken))) return true;
                        
                        // Coincidencia por sinónimos (si yo ofrezco "guitarra" y el busca "guitar")
                        List<String> myTokenSynonyms = expandSearchTerm(myToken);
                        if (myTokenSynonyms.contains(iId)) return true;
                    }
                    return false;
                });
            }

            // B. CHECK UBICACIÓN
            boolean isClose = checkLocationMatch(candidate, myLocation);
            String distanceLabel = isClose ? "Cerca de ti" : "Lejos de ti";
            final boolean finalIsMatch = isMatch;

            // C. GENERAR RESULTADOS (SOLO LAS SKILLS BUSCADAS)
            candidate.getSkills().stream()
                .filter(skill -> {
                    String sId = normalizeKey(skill.getId());
                    String sName = normalizeKey(skill.getName());
                    
                    // ¿Coincide el ID o el Nombre con ALGUNO de los términos expandidos?
                    // Esto soluciona que te falten resultados.
                    boolean idMatch = expandedSearchIds.stream().anyMatch(ex -> sId.equals(ex) || sId.contains(ex));
                    boolean nameMatch = expandedSearchIds.stream().anyMatch(ex -> sName.contains(ex));
                    
                    return idMatch || nameMatch;
                })
                .forEach(skill -> {
                    results.add(mapToUserSwapDTO(candidate, skill, finalIsMatch, distanceLabel));
                });
        }

        // 4. ORDENAMIENTO
        results.sort((o1, o2) -> {
            // 1. Matches primero
            if (o1.isSwapMatch() != o2.isSwapMatch()) return o1.isSwapMatch() ? -1 : 1;
            
            // 2. Ubicación
            boolean loc1 = "Cerca de ti".equals(o1.getDistance());
            boolean loc2 = "Cerca de ti".equals(o2.getDistance());
            if (loc1 != loc2) return loc1 ? -1 : 1;
            
            // 3. Rating
            return Double.compare(o2.getRating(), o1.getRating());
        });

        return results;
    }

    private boolean checkLocationMatch(User candidate, String myLocation) {
        if (myLocation.isEmpty() || candidate.getLocation() == null) return false;
        String candidateLoc = normalizeKey(candidate.getLocation());
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

        String rawName = (skill.getName() != null && !skill.getName().isEmpty()) ? skill.getName() : skill.getId();
        String displayName = capitalize(rawName);

        dto.setSkillName("Clase de " + displayName); 
        dto.setSkillIcon(skill.getIcon() != null ? skill.getIcon() : "🎓");
        dto.setSkillCategory(skill.getCategory());
        dto.setSkillLevel(skill.getLevel());

        return dto;
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }


    public UserSwapDTO getUserById(String userId) {
        Optional<User> userOpt = userRepository.findUserById(userId);

        if (userOpt.isEmpty()) {
            return null;
        }

        User user = userOpt.get();

        UserSwapDTO dto = new UserSwapDTO();
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        dto.setLocation(user.getLocation());

        // Si tiene skills, usamos la primera para la info principal
        // Y rellenamos la lista completa 'userSkills'
        if (user.getSkills() != null && !user.getSkills().isEmpty()) {

            // 1. Info Principal (Header del componente)
            UserSkills s = user.getSkills().get(0);
            dto.setSkillName(s.getName() != null ? s.getName() : s.getId());
            dto.setSkillIcon(s.getIcon() != null ? s.getIcon() : "🎓");
            dto.setSkillLevel(s.getLevel());
            dto.setSkillCategory(s.getCategory());

            // 2. LISTA COMPLETA DE SKILLS (Para el panel de intereses)
            List<UserSwapDTO.SkillItem> allSkills = user.getSkills().stream()
                    .map(skill -> new UserSwapDTO.SkillItem(
                            skill.getName() != null ? skill.getName() : skill.getId(),
                            skill.getCategory(),
                            skill.getLevel()
                    ))
                    .collect(Collectors.toList());

            dto.setUserSkills(allSkills);
        }

        dto.setRating(4.8);
        dto.setDistance("Cerca de ti");
        dto.setSwapMatch(false);

        return dto;
    }
}