package com.swaply.backend.application.usecase;

import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {

    private final Argon2PasswordEncoder passwordEncoder;

    public PasswordService() {
        this.passwordEncoder = new Argon2PasswordEncoder(16, 32, 1, 6000, 10); // 16 -> salt length, 32 -> hash length, 1 -> parallelism, 6000 -> RAMmemory cost(KB), 10 -> iterations
    }


    public String hash(String password) {
        return passwordEncoder.encode(password);
    }
    public boolean match(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    
}
