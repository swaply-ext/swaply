package com.swaply.backend.application.home;

import com.swaply.backend.application.home.service.HomeService;
import com.swaply.backend.application.search.dto.UserSwapDTO;
import com.swaply.backend.config.security.SecurityUser;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<UserSwapDTO>> getRecommendations(
            @AuthenticationPrincipal SecurityUser user, 
            @PageableDefault(size = 6) Pageable pageable) { // Default size 6
        
        List<UserSwapDTO> matches = homeService.getRecommendedMatches(user.getUsername(), pageable);
        return ResponseEntity.ok(matches);
    }
}