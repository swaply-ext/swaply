package com.swaply.backend.shared.UserCRUD;

import java.text.Normalizer;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.swaply.backend.application.auth.service.PasswordService;
import com.swaply.backend.config.security.SecurityUser;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.UserCRUD.exception.UserNotFoundException;
import java.util.regex.Pattern;

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

    public boolean existsByUsername(String username) {
        return repository.existsUserByUsername(username);
    }

    public UserDTO getUserByUsername(String username) {
        User user = repository.findUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
        return mapper.entityToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = repository.findUserByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return mapper.entityToDTO(user);
    }

    public UserDTO getUserByID(String id) {
        User user = repository.findUserById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof SecurityUser principal) {
            if (principal.isModerator() || principal.getUsername().equals(id)) {
                return mapper.entityToDTO(user);
            }
        }

        return mapper.publicDTOToUserDTO(mapper.entityToPublicDTO(user));
    }

    public String getUsernameById(String id) {
        return repository.findUsernameById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }

    public List<UserDTO> getAllUsers() {
        return repository.findAllUsers()
                .stream()
                .map(mapper::entityToDTO)
                .collect(Collectors.toList());
    }

    private String normalizeString(String input) {
        if (input == null)
            return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").toLowerCase();
    }

    public List<UserDTO> findUsersByUsernameContaining(String usernameFragment) {
        String normalized = normalizeString(usernameFragment);
        return repository.findUsersByUsernameContaining(normalized)
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
    public UserDTO createUser(UserDTO dto) {
        User newUser = mapper.dtoToEntity(dto);

        newUser.setId(UUID.randomUUID().toString());

        String passwordHash = passwordService.hash(dto.getPassword());
        newUser.setPassword(passwordHash);

        User savedUser = repository.save(newUser);

        return mapper.entityToDTO(savedUser);
    }

    @Transactional
    public UserDTO updateUser(String id, UserDTO dto) {
        User user = repository.findUserById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        mapper.updateUserFromDto(dto, user);
        User saved = repository.save(user);
        return mapper.entityToDTO(saved);
    }

    @Transactional
    public void updateUserPassword(String id, String newPassword) {
        User user = repository.findUserById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        String passwordHash = passwordService.hash(newPassword);
        user.setPassword(passwordHash);

        repository.save(user);
    }

    public List<UserDTO> getUsersByLocation(String location) {
        return repository.findUserByLocation(location)
                .stream()
                .map(mapper::entityToDTO)
                .collect(Collectors.toList());
    }

    public boolean existsUserByLocation(String location) {
        return repository.existsUserByLocation(location);
    }
}