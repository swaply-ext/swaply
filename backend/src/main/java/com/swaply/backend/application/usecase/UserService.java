package com.swaply.backend.application.usecase;
import com.azure.spring.data.cosmos.core.CosmosTemplate;
import com.swaply.backend.application.dto.UserDTO;
import com.swaply.backend.application.mapper.UserMapper;
import com.swaply.backend.domain.model.User;
import com.swaply.backend.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final CosmosTemplate cosmosTemplate;
    private final UserRepository userRepo;
    private final UserMapper userMapper;

    public UserService(CosmosTemplate cosmosTemplate, UserRepository userRepo, UserMapper userMapper) {
        this.cosmosTemplate = cosmosTemplate;
        this.userRepo = userRepo;
        this.userMapper = userMapper;
    }

    public UserDTO createUser(UserDTO dto) {
        String container = cosmosTemplate.getContainerName(User.class);
        User saved = cosmosTemplate.upsertAndReturnEntity(container, userMapper.dtoToEntity(dto));
        return dto;
    }

    public List<UserDTO> getAllUsers() {
        return userRepo.findByType("User")
                .stream()
                .map(userMapper::entityToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserByID(String id) {
        return userMapper.entityToDTO(userRepo.findById(id).orElse(null));
    }

    public void deleteUserById(String id) {
        User user = userRepo.findById(id).orElse(null);
        if (user != null) {
            userRepo.delete(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }
}
