package com.swaply.backend.shared.UserCRUD.Model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;

@Container(containerName = "swaply-container")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @PartitionKey
    private String type = "user";

    private String username;
    private String name;
    private String surname;
    private String email;
    private String password;
    private Integer code;
    private Integer ttl;
    private Location location;
    private String gender;
    private String phone;
    private String postalCode;
    private Double rating;
    private List<UserSkills> skills;
    private List<UserSkills> interests;
    @JsonFormat(pattern="dd/MM/yyyy")
    private Date birthDate;
    private String description;
    private boolean isVerified;
    private String profilePhotoUrl;
    private boolean isPremium;
    private boolean isModerator;
    private List<Swap> swaps;
}
