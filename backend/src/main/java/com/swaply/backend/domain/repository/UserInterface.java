package com.swaply.backend.domain.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.domain.model.User;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface UserInterface extends CosmosRepository<User, String> {
    Optional<User> findByEmail(String email);
    
}