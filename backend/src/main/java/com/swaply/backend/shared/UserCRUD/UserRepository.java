package com.swaply.backend.shared.UserCRUD;

import com.azure.cosmos.models.PartitionKey;
import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.azure.spring.data.cosmos.repository.Query;
import com.swaply.backend.shared.UserCRUD.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends CosmosRepository<User, String> {

    String type = "user";
    PartitionKey USER_PARTITION_KEY = new PartitionKey(type);

    // --- Métodos Base ---

    default boolean existsUserById(String id) {
        return findById(id, USER_PARTITION_KEY).isPresent();
    }

    default void deleteUserById(String id) {
        deleteById(id, USER_PARTITION_KEY);
    }

    default Optional<User> findUserById(String id) {
        return findById(id, USER_PARTITION_KEY);
    }

    // --- Derived Queries ---

    List<User> findByType(String type);
    Optional<User> findByTypeAndEmail(String type, String email);
    boolean existsByTypeAndEmail(String type, String email);
    List<User> findByTypeAndUsernameContaining(String type, String usernameFragment);
    boolean existsUserByTypeAndUsername(String type, String username);
    List<User> findByTypeAndLocation(String type, String location);
    boolean existsUserByTypeAndLocation(String type, String location);
    Optional<User> findUserByTypeAndUsername(String type, String username);

    // --- Consultas Personalizadas ---

    // 1. Para paginación directa en base de datos (Búsqueda simple)
    @Query(value = "SELECT * FROM c WHERE c.type = 'user' AND EXISTS(SELECT VALUE s FROM s IN c.skills WHERE CONTAINS(s.id, @skillId, true))")
    Page<User> findUsersBySingleSkillId(@Param("skillId") String skillId, Pageable pageable);

    // 2. Para filtros y recomendaciones (Devuelve PÁGINA)
    @Query(value = "SELECT * FROM c WHERE c.type = 'user' AND EXISTS(SELECT VALUE s FROM s IN c.skills WHERE ARRAY_CONTAINS(@skillIds, s.id))")
    Page<User> findUsersByMultipleSkillIds(@Param("skillIds") List<String> skillIds, Pageable pageable);

    // 3. NUEVO: Para obtener TODOS los candidatos y filtrar/paginar en memoria (Devuelve LISTA)
    // Esto evita el error de usar Pageable.unpaged() con Cosmos DB
    @Query(value = "SELECT * FROM c WHERE c.type = 'user' AND EXISTS(SELECT VALUE s FROM s IN c.skills WHERE ARRAY_CONTAINS(@skillIds, s.id))")
    List<User> findUsersByMultipleSkillIdsList(@Param("skillIds") List<String> skillIds);

    // --- Proyecciones y Utilidades ---

    @Query(value = "SELECT VALUE c.username FROM c WHERE c.id = @id AND c.type = 'user'")
    Optional<String> findUsernameOnlyById(@Param("id") String id);

    @Query(value = "SELECT VALUE c.profilePhotoUrl FROM c WHERE c.id = @id AND c.type = 'user'")
    Optional<String> findProfilePhotoUrlOnlyById(@Param("id") String id);

    default Optional<String> findUsernameById(String id){
        return findUsernameOnlyById(id);
    }

    default Optional<String> findprofilePhotoUrlById(String id){
        return findProfilePhotoUrlOnlyById(id);
    }

    default List<User> findAllUsers() {
        return this.findByType(type);
    }

    default Optional<User> findUserByEmail(String email) {
        return findByTypeAndEmail(type, email);
    }

    default boolean existsUserByEmail(String email) {
        return existsByTypeAndEmail(type, email);
    }

    default List<User> findUsersByUsernameContaining(String usernameFragment) {
        return findByTypeAndUsernameContaining(type, usernameFragment);
    }

    default boolean existsUserByUsername(String username) {
        return existsUserByTypeAndUsername(type, username);
    }

    default List<User> findUserByLocation(String location) {
        return findByTypeAndLocation(type, location);
    }

    default boolean existsUserByLocation(String location) {
        return existsUserByTypeAndLocation (type, location);
    }

    default Optional<User> findUserByUsername(String username) {
        return findUserByTypeAndUsername(type, username);
    }

    default Page<User> findUserBySkillId(String skillId, Pageable pageable) {
        return findUsersBySingleSkillId(skillId, pageable);
    }
}