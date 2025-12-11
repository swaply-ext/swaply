package com.swaply.backend.shared.UserCRUD.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {

    private String placeId;

    private double lat;
    private double lon;

    private String displayName;

}