package com.swaply.backend.application.swap.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.swaply.backend.application.swap.SwapMapper;
import com.swaply.backend.application.swap.dto.SwapDTO;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import com.swaply.backend.shared.UserCRUD.Model.Swap;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.exception.UserNotFoundException;

@Service
public class SwapService {

    private final UserRepository repository;
    private final SwapMapper mapper;

    public SwapService(SwapMapper mapper, UserRepository repository) {
        this.mapper = mapper;
        this.repository = repository;
    }

    public Swap createSwap(String sendingUser, SwapDTO dto) {
        String id = UUID.randomUUID().toString();
        
        Swap sentSwap = mapper.toEntity(dto);
        sentSwap.setStatus(Swap.Status.STANDBY);
        sentSwap.setIsRequester(true);
        sentSwap.setId(id);

        Optional<User> sender = repository.findUserById(sendingUser);
        if (sender.isPresent()) {
            User user = sender.get();
            user.getSwaps().add(sentSwap);
            repository.save(user);
        }
        else{
            throw new UserNotFoundException(sendingUser);
        }


        Swap receivedSwap = mapper.toEntity(invertSwap(sendingUser, dto));
        receivedSwap.setStatus(Swap.Status.STANDBY);
        receivedSwap.setIsRequester(false);
        receivedSwap.setId(id);

        Optional<User> receiver = repository.findUserById(sentSwap.getUserId());
        if (receiver.isPresent()) {
            User user = receiver.get();
            user.getSwaps().add(receivedSwap);
            repository.save(user);
        }
        else{
            throw new UserNotFoundException(sendingUser);
        }

        return sentSwap;
    }

    private SwapDTO invertSwap(String sendingUser, SwapDTO dto) {
        SwapDTO newdto = new SwapDTO();
        newdto.setInterest(dto.getSkill());
        newdto.setSkill(dto.getInterest());
        newdto.setRequestedUserId(sendingUser);
        return newdto;
    }


}
