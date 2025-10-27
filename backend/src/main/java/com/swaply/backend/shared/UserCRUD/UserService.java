package com.swaply.backend.shared.UserCRUD;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.swaply.backend.application.auth.dto.RegisterDTO;
import com.swaply.backend.application.auth.service.PasswordService;
import com.swaply.backend.shared.UserCRUD.dto.UpdateUserDTO;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.UserCRUD.exception.UserNotFoundException;


@Service
public class UserService {

    private final UserRepository repository;
    private final UserMapper mapper;
    private final PasswordService passwordService;

    public UserService(UserRepository repository, UserMapper mapper, PasswordService passwordService) {
        this.repository = repository;
        this.mapper = mapper;
        this.passwordService = passwordService;
    }

    public boolean existsById(String id) {
        return repository.existsUserById(id);
    }

    public boolean existsByEmail(String email) {
        return repository.existsUserByEmail(email);
    }

    public boolean existsUserByUsername(String username){
        return repository.existsUserByUsername(username);
    }
    

    public UserDTO getUserByEmail(String email) {
        User user = repository.findUserByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return mapper.entityToDTO(user);
    }

    public UserDTO getUserByID(String id) {
        User user = repository.findUserById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        return mapper.entityToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return repository.findAllUsers()
                .stream()
                .map(mapper::entityToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> findUsersByUsernameContaining(String usernameFragment) {
        return repository.findUsersByUsernameContaining(usernameFragment)
                .stream()
                .map(mapper::entityToDTO)
                .collect(Collectors.toList());
    }

    public void deleteUserById(String id) {
        if (!repository.existsUserById(id)) {
            throw new UserNotFoundException("User not found with id: " + id);
        }
        repository.deleteUserById(id);
    }

    @Transactional
    public UserDTO updateUser(String id, UpdateUserDTO dto) {
        User user = repository.findUserById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        mapper.updateUserFromDto(dto, user);
        User saved = repository.save(user);
        return mapper.entityToDTO(saved);
    }

    @Transactional
    public UserDTO createUser(RegisterDTO dto) {
        User newUser = mapper.fromRegisterDTO(dto);

        newUser.setId(UUID.randomUUID().toString());
        String passwordHash = passwordService.hash(dto.getPassword());
        newUser.setPassword(passwordHash);

        newUser.setModerator(false);
        newUser.setVerified(false);
        newUser.setPremium(false);

        User savedUser = repository.save(newUser);

        return mapper.entityToDTO(savedUser);

    }

    @Transactional
    public void updateUserPassword(String id, String newPassword) {
        User user = repository.findUserById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        String passwordHash = passwordService.hash(newPassword);
        user.setPassword(passwordHash);

        repository.save(user);
    }

}