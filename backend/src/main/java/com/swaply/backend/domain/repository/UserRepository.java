package com.swaply.backend.domain.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.domain.model.User;

import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends CosmosRepository<User, String> {
    List<User> findByType(String type);
    
    User findByEmail(String email);
    Boolean existsByEmail(String email);
}