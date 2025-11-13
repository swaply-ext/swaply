package com.swaply.backend.shared.UserCRUD;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.azure.spring.data.cosmos.repository.Query;
import com.swaply.backend.shared.UserCRUD.Model.Skills;
import java.util.List;

import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SkillsRepository extends CosmosRepository<Skills, String> {
    //hay que ponerlo así porque sino también recoge datos de usuarios.
    //Esta query solo recoge las skills
    @Query(value = "SELECT * FROM c WHERE c.type = 'skills' AND CONTAINS(c.normalizedName, @query, true)")
    List<Skills> searchSkillsCustom(@Param("query") String query);

}
