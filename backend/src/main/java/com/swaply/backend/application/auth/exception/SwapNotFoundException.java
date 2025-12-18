package com.swaply.backend.application.auth.exception;

import com.azure.cosmos.implementation.NotFoundException;

public class SwapNotFoundException extends NotFoundException {
    public SwapNotFoundException(String message) {
        super(message);
    }
}
