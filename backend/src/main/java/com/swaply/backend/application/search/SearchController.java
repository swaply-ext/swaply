package com.swaply.backend.application.search;

import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.application.search.service.SearchService;
import com.swaply.backend.config.security.SecurityUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/match")
    public ResponseEntity<List<UserSwapDTO>> searchMatches(
            @RequestParam String skill,
            @AuthenticationPrincipal SecurityUser user) {
        
        // Pasamos el ID del usuario logueado al servicio para calcular el match recíproco
        List<UserSwapDTO> results = searchService.searchUsersWithMatch(skill, user.getUsername());
        
        return ResponseEntity.ok(results);
    }
}