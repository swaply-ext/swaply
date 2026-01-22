package com.swaply.backend.shared.chat.exception;

public class UserNotInThisRoomException extends RuntimeException {
    public UserNotInThisRoomException(String message) {
        super(message);
    }
}