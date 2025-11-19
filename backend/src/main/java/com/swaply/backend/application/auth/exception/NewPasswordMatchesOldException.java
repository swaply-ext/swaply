package com.swaply.backend.application.auth.exception;

public class NewPasswordMatchesOldException extends RuntimeException {
    
    public NewPasswordMatchesOldException(String message) {
        super(message);
    }
}