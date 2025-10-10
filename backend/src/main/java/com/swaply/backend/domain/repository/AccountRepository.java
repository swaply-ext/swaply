package com.swaply.backend.domain.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.domain.model.Register;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends CosmosRepository<Register, String> {
    Register findByEmail(String email);
}