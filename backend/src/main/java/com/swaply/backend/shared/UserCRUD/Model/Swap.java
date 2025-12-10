package com.swaply.backend.shared.UserCRUD.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Swap {
    private String id;
    private String requestedUserId;
    private String skill;
    private String interest;
    private Status status;
    private Boolean isRequester;

    public enum Status {
        ACCEPTED,
        STANDBY,
        DENIED
    }
}