package com.swaply.backend.domain.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.domain.model.Cancion;
import org.springframework.stereotype.Repository;

@Repository
public interface CancionRepository extends CosmosRepository<Cancion, String> {
}
