package com.swaply.backend.application.dto;

import org.springframework.data.annotation.Id;

import com.azure.spring.data.cosmos.core.mapping.PartitionKey;

public class UserDTO {

    @Id
    private String id;
    
    @PartitionKey
    private String type = "User";
    private String username;
    private String fullName;
    private String email;
    private String passwordHash;
    private String location;
    private String gender;
    private int age;
    private String description;
    private boolean isVerified;
    private String profilePhotoUrl;
    private boolean isPremium;
    private boolean isModerator;

    public UserDTO() {
    }

    public UserDTO(String id, String username, String fullName, String email, String passwordHash,
            String location, String gender, int age, String description, boolean isVerified, String profilePhotoUrl,
            boolean isPremium, boolean isModerator) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.location = location;
        this.gender = gender;
        this.age = age;
        this.description = description;
        this.isVerified = isVerified;
        this.profilePhotoUrl = profilePhotoUrl;
        this.isPremium = isPremium;
        this.isModerator = isModerator;
    }

    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean isVerified) {
        this.isVerified = isVerified;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public boolean isPremium() {
        return isPremium;
    }

    public void setPremium(boolean isPremium) {
        this.isPremium = isPremium;
    }

    public boolean isModerator() {
        return isModerator;
    }

    public void setModerator(boolean isModerator) {
        this.isModerator = isModerator;
    }
    
    
}