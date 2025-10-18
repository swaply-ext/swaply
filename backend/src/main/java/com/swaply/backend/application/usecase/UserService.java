package com.swaply.backend.application.usecase;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import java.lang.reflect.Method;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.application.exception.UserNotFoundException;
import com.swaply.backend.application.mapper.UserMapper;
import com.swaply.backend.domain.model.User;
import com.swaply.backend.domain.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository repository;
    private final UserMapper mapper;

    public UserService(UserRepository repository, UserMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public boolean existsById(String id) {
        return repository.existsUserById(id);
    }

    public boolean existsByEmail(String email) {
        return repository.existsUserByEmail(email);
    }

    public UserDTO getUserByEmail(String email) {
        User user = repository.findUserByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return mapper.toDTO(user);
    }

    public UserDTO getUserByID(String id) {
        User user = repository.findUserById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        return mapper.toDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return repository.findAllUsers()
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteUserById(String id) {
        if (!repository.existsUserById(id)) {
            throw new UserNotFoundException("User not found with id: " + id);
        }
        repository.deleteUserById(id);
    }

    @Transactional
    public UserDTO updateUser(String id, UserDTO dto) {
        User user = repository.findUserById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        mapper.updateUserFromDto(dto, user);
        User saved = repository.save(user);
        return mapper.toDTO(saved);
    }

    public UserDTO createUser(UserDTO dto) {
        User user = mapper.toEntity(dto);
        User saved = repository.save(user);
        return mapper.toDTO(saved);
    }

}