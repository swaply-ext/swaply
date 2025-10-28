package com.swaply.backend.shared.UserCRUD;

import com.azure.cosmos.models.PartitionKey;
import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.swaply.backend.shared.UserCRUD.Model.User;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends CosmosRepository<User, String> {

    String type = "user";
    PartitionKey USER_PARTITION_KEY = new PartitionKey(type);

    // Metodos propios de CosmosRepository sin (Derived Queries)

    default boolean existsUserById(String id) {
        return findById(id, USER_PARTITION_KEY).isPresent();
    }

    default void deleteUserById(String id) {
        deleteById(id, USER_PARTITION_KEY);
    }

    default Optional<User> findUserById(String id) {
        return findById(id, USER_PARTITION_KEY);
    }

    // Derived Queries

    List<User> findByType(String type);

    Optional<User> findByTypeAndEmail(String type, String email);

    boolean existsByTypeAndEmail(String type, String email);

    List<User> findByTypeAndUsernameContaining(String type, String usernameFragment);

    boolean existsUserByTypeAndUsername(String type, String username);

    // Metodos con Derived Queries para no tener que definir type cada vez

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

}