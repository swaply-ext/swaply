package com.swaply.backend.domain.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import org.springframework.data.annotation.Id;
import java.time.LocalDateTime;


@Container(containerName = "swaply")
public class Ban {

    @Id
    private String banId;
    private String bannedUserId;
    private String moderatorId;
    private String reason;
    private LocalDateTime time;

    public Ban() {
    }

    public Ban(String banId, String bannedUserId, String moderatedId, String reason, LocalDateTime time) {

        this.banId = banId;
        this.bannedUserId = bannedUserId;
        this.moderatorId = moderatorId;
        this.reason = reason;
        this.time = time;
    }

    // Getters and setters
    public String getBanId() {
        return banId;
    }

    public void setBanId(String banId) {
        this.banId = banId;
    }

    public String getBannedUserId() {
        return bannedUserId;
    }

    public void setBannedUserId(String bannedUserId) {
        this.bannedUserId = bannedUserId;
    }

    public String getModeratorId() {
        return moderatorId;
    }

    public void setModeratorId(String moderatorId) {
        this.moderatorId = moderatorId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }
}

