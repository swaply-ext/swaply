package com.swaply.backend.domain.repository;
import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.domain.model.Event;


public interface EventRepository extends CosmosRepository<Event, String> {

}



