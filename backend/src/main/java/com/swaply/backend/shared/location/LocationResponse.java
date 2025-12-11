package com.swaply.backend.shared.location;


import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class LocationResponse {
    @JsonProperty("place_id")
    private String placeId;
    
    private String lat; 
    private String lon; 
    
    @JsonProperty("class")
    private String locationClass;
    private String type; 

    @JsonProperty("display_name")
    private String displayName;
    
    @JsonProperty("display_place")
    private String displayPlace;
    
    @JsonProperty("display_address")
    private String displayAddress;

    private Map<String, String> address; 

}
