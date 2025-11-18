package com.swaply.backend.application.account;

import com.azure.cosmos.models.PartitionKey;
import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.shared.UserCRUD.Model.Skills;



import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends CosmosRepository<Skills, String> {

    String skillType = "skills";
    PartitionKey SKILL_PARTITION_KEY = new PartitionKey(skillType);
    List<Skills> findByTypeAndIdContaining(String skillType, String query);



    default List<Skills> findSkillsbyContaining(String query) {
        return this.findByTypeAndIdContaining(skillType, query);
    }

    default Optional<Skills> getSkillsbyId(String id) {
        return findById(id, SKILL_PARTITION_KEY);
    }
}