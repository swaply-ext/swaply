package com.swaply.backend.shared.location;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(@Autowired LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping("/autocomplete")
    public ResponseEntity <List<LocationResponse>> autocompleteLocation(
            @RequestParam(required = false) String query) {
        if(query != null){
            List<LocationResponse> results = locationService.test(query);
            return ResponseEntity.ok(results);
        }
        throw new IllegalArgumentException("Query parameter is required");
    }
}
