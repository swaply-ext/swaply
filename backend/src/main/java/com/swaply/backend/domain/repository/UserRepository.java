package com.swaply.backend.domain.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.domain.model.User;

public interface UserRepository extends CosmosRepository<User, String> {
    
}
