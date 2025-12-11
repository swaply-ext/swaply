package com.swaply.backend.shared.location;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;


@Service
public class LocationService {

    @Value("${LocationIQ-API-KEY}")
    private String API_KEY;

    private final LocationMapper mapper;


    public LocationService(LocationMapper mapper) {
        this.mapper = mapper;
    }

    private String getBaseUri(){
        return "https://api.locationiq.com/v1/autocomplete?key=" + API_KEY;
    }

    public List<LocationResponse> test(String query) {
        String BASE_URI = getBaseUri();
        RestClient restClient = RestClient.create();
        List<LocationResponse> response = restClient.get()
                .uri(BASE_URI + "&q="+ query)
                .retrieve()
                .body(new ParameterizedTypeReference<List<LocationResponse>>() {});
        return response;      
    }




}