package com.swaply.backend.shared.location;

import java.text.DecimalFormat;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.swaply.backend.shared.UserCRUD.Model.Location;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.config.security.SecurityUser;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.location.dto.LocationResponseDTO;

@Service
public class LocationService {

    @Value("${LocationIQ-API-KEY}")
    private String API_KEY;

    private final LocationMapper mapper;
    private final UserService userService;

    public LocationService(LocationMapper mapper, UserService userService) {
        this.mapper = mapper;
        this.userService = userService;
    }

    private String getBaseUri() {
        return "https://api.locationiq.com/v1/autocomplete?key=" + API_KEY;
    }

    public List<Location> getLocations(String query) {
        String BASE_URI = getBaseUri();
        RestClient restClient = RestClient.create();
        List<LocationResponseDTO> responseList = restClient.get()
                .uri(BASE_URI + "&q=" + query)
                .retrieve()
                .body(new ParameterizedTypeReference<List<LocationResponseDTO>>() {
                });
        if (responseList == null) {
            return List.of();
        }
        List<Location> locations = responseList.stream()
                .map(mapper::fromLocationRequest)
                .collect(Collectors.toList());

        return locations;
    }

    private Double haversine(double val) {
        return Math.pow(Math.sin(val / 2), 2);
    }

    public String calculateDistance(String user1_id, String user2_username) {
        UserDTO user1 = userService.getUserByID(user1_id);
        UserDTO user2 = userService.getUserByUsername(user2_username);
        Location user1Location = user1.getLocation();
        Location user2Location = user2.getLocation();

        double startLat = user1Location.getLat();
        double startLong = user1Location.getLon();
        double endLat = user2Location.getLat();
        double endLong = user2Location.getLon();

        Integer EARTH_RADIUS = 6371;

        double dLat = Math.toRadians((endLat - startLat));
        double dLong = Math.toRadians((endLong - startLong));

        startLat = Math.toRadians(startLat);
        endLat = Math.toRadians(endLat);

        double a = haversine(dLat) + Math.cos(startLat) * Math.cos(endLat) * haversine(dLong);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        double distanceKM = EARTH_RADIUS * c;
        DecimalFormat df = new DecimalFormat("#.#");

        if (distanceKM >= 10){
            df = new DecimalFormat("#");
        }
        
        return df.format(distanceKM);
        
    }
}