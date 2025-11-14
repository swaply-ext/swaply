package com.swaply.backend.application.account;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.application.account.dto.SkillSearchDTO;
import com.swaply.backend.shared.UserCRUD.Model.Skills;


import java.util.List;


import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends CosmosRepository<Skills, String> {

    String skillType = "skills";
    List<SkillSearchDTO> findByTypeAndIdContaining(String type, String query);



    default List<SkillSearchDTO> findSkillsbyContaining(String query) {
        return this.findByTypeAndIdContaining(skillType, query);
    }
}