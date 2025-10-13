package com.swaply.backend.domain.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;

import org.springframework.data.annotation.Id;


@Container(containerName = "swaply-container")
public class User {

    @Id
    private String id;
    
    @PartitionKey
    private String type = "user";
    
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

    //private List<String> blockedUsers;
    //private List<LearningSkill> learningSkills;
    //private List<TeachingSkill> teachingSkills;
    //private List<Rating> ratings;

    // public User() {}

    // public User(String username, String fullName, String email, String passwordHash, String location,
    //         String gender, int age, String description, boolean isVerified, String profilePhotoUrl, boolean isPremium,
    //         boolean isModerator){//, List<String> blockedUsers) {
    //     this.id = UUID.randomUUID().toString();
    //     this.username = username;
    //     this.fullName = fullName;
    //     this.email = email;
    //     this.passwordHash = passwordHash;
    //     this.location = location;
    //     this.gender = gender;
    //     this.age = age;
    //     this.description = description;
    //     this.isVerified = isVerified;
    //     this.profilePhotoUrl = profilePhotoUrl;
    //     this.isPremium = isPremium;
    //     this.isModerator = isModerator;
    //     //this.blockedUsers = blockedUsers;
    // }

    public String getId() {
        return id;
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
    /* 
    public List<String> getBlockedUsers() {
        return blockedUsers;
    }

    public void setBlockedUsers(List<String> blockedUsers) {
        this.blockedUsers = blockedUsers;
    } */

    public String getType() {
        return type;
    }
}