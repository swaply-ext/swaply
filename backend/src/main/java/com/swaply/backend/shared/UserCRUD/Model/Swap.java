package com.swaply.backend.shared.UserCRUD.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

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
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    public enum Status {
        ACCEPTED,
        STANDBY,
        DENIED
    }
}