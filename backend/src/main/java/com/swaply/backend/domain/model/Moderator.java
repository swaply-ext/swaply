package com.swaply.backend.domain.model;

import org.springframework.data.annotation.Id;
import com.azure.spring.data.cosmos.core.mapping.Container;

@Container(containerName = "swaply")
public class Moderator {

    @Id
    private String id;
    private String[] roles;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String[] getroles() {
        return roles;
    }

    public void setroles(String[] roles) {
        this.roles = roles;
    }

}