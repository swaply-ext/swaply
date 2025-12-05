package com.swaply.backend.shared.UserCRUD.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Swap {
    private String id;
    private String requestingUser;
    private String requestedUser;
    private String skill;
    private String interest;
    private Status status;

    public enum Status {
        ACCEPTED,
        STANDBY,
        DENIED
    }
}