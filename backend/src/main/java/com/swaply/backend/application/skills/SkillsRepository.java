package com.swaply.backend.application.skills;

import com.azure.cosmos.models.PartitionKey;
import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.shared.UserCRUD.Model.Skills;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public interface SkillsRepository extends CosmosRepository<Skills, String> {

    String type = "skills";
    PartitionKey SKILL_PARTITION_KEY = new PartitionKey(type);

    // Metodos propios de CosmosRepository sin (Derived Queries)

    default Optional<Skills> getSkillsbyId(String id) {
        return findById(id, SKILL_PARTITION_KEY);
    }

    // Derived Queries

    List<Skills> findByTypeAndIdContaining(String skillType, String query);

    List<Skills> findByType(String type);

    // Metodos con Derived Queries para no tener que definir type cada vez

    default List<Skills> findSkillsbyContaining(String query) {
        return this.findByTypeAndIdContaining(type, query);
    }

    default List<Skills> findAllSkills() {
        return this.findByType(type);
    }
}