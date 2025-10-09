package com.swaply.backend.domain.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.domain.model.Register;
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends CosmosRepository<Register, String> {
    Optional<Register> findByEmail(String email);
    
}