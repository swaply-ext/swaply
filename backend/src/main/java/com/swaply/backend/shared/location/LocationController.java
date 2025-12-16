package com.swaply.backend.shared.location;

import java.text.DecimalFormat;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.swaply.backend.shared.UserCRUD.Model.Location;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService service;

    public LocationController(@Autowired LocationService service) {
        this.service = service;
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<Location>> autocompleteLocation(
            @RequestParam(required = false) String query) {
        if (query != null) {
            List<Location> results = service.getLocations(query);
            return ResponseEntity.ok(results);
        }
        throw new IllegalArgumentException("Query parameter is required");
    }

    @PostMapping("/distance")
    public ResponseEntity<String> calculateDistance(String user1_id, String user2_username){
        return ResponseEntity.ok(service.calculateDistance(user1_id, user2_username));
    }
}
