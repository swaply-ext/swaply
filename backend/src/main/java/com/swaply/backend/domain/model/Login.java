package com.swaply.backend.domain.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Container(containerName = "swaply-container")

public class Login {

    @PartitionKey
    private String type = "user";

    private String email;
    private String password;
    private Boolean acceptedTerms;

    public String getType() {
        return this.type;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
