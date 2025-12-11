package com.swaply.backend.application.swap.service;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.swaply.backend.application.swap.SwapMapper;
import com.swaply.backend.application.swap.dto.SwapDTO;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.Model.Swap;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.exception.UserNotFoundException;

@Service
public class SwapService {

    private final UserRepository repository;
    private final SwapMapper mapper;
    private final UserService userService;

    public SwapService(SwapMapper mapper, UserRepository repository, UserService userService) {
        this.mapper = mapper;
        this.repository = repository;
        this.userService = userService;
    }

    public Swap createSwap(String sendingUser, SwapDTO dto) {
        String id = UUID.randomUUID().toString();

        Swap sentSwap = mapper.toEntity(dto);
        sentSwap.setStatus(Swap.Status.STANDBY);
        sentSwap.setIsRequester(true);
        sentSwap.setId(id);
        sentSwap.setRequestedUserId(userService.getUserByUsername(dto.getRequestedUsername()).getId()); //obtiene el id a partir del username

        Optional<User> sender = repository.findUserById(sendingUser);
        if (sender.isPresent()) {
            User user = sender.get();
            if (user.getSwaps() == null) {
                user.setSwaps(new ArrayList<>());
            }
            user.getSwaps().add(sentSwap);
            repository.save(user);
        }
        else{
            throw new UserNotFoundException(sendingUser);
        }


        Swap receivedSwap = mapper.toEntity(invertSwap(dto));
        receivedSwap.setStatus(Swap.Status.STANDBY);
        receivedSwap.setIsRequester(false);
        receivedSwap.setId(id);
        receivedSwap.setRequestedUserId(sendingUser);

        Optional<User> receiver = repository.findUserById(sentSwap.getRequestedUserId());
        if (receiver.isPresent()) {
            User user = receiver.get();
            if (user.getSwaps() == null) {
                user.setSwaps(new ArrayList<>());
            }
            user.getSwaps().add(receivedSwap);
            repository.save(user);
        }
        else{
            throw new UserNotFoundException(sendingUser);
        }

        return sentSwap;
    }

    private SwapDTO invertSwap(SwapDTO dto) {
        SwapDTO newdto = new SwapDTO();
        newdto.setInterest(dto.getSkill());
        newdto.setSkill(dto.getInterest());
        return newdto;
    }


}
