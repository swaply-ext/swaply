package com.swaply.backend.application.swap.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.swaply.backend.application.swap.SwapMapper;
import com.swaply.backend.application.swap.dto.SwapDTO;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
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
        sentSwap.setRequestedUserId(userService.getUserByUsername(dto.getRequestedUsername()).getId());

        Optional<User> sender = repository.findUserById(sendingUser);
        if (sender.isPresent()) {
            User user = sender.get();
            if (user.getSwaps() == null) {
                user.setSwaps(new ArrayList<>());
            }
            user.getSwaps().add(sentSwap);
            repository.save(user);
        } else {
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
        } else {
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

    public List<Swap> getAllSwaps(String id) {
        UserDTO userSwap = userService.getUserByID(id);
        List<Swap> listaSwaps = userSwap.getSwaps();
        return listaSwaps;
    }

    public Swap getNextSwap(String id) {
        UserDTO userSwap = userService.getUserByID(id);
        Swap nextSwap = userSwap.getSwaps().stream()
                .filter(l -> l.getStatus() == Swap.Status.STANDBY)
                .filter(l -> !l.getIsRequester())
                .findFirst()
                .orElse(null); // o lanzar excepción;
        return nextSwap;
    }

    public Swap getSwapFromDTO(UserDTO userSwap, String swapId) {
        Swap swap = userSwap.getSwaps().stream()
                .filter(s -> s.getId().equals(swapId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Swap not found for sender"));
        return swap;
    }

    public void updateSwapStatus(String swapId, String status, String currentUserId) {
        //get sender
        UserDTO sender = userService.getUserByID(currentUserId);
        Swap senderSwap = getSwapFromDTO(sender, swapId);

        //get receiver
        UserDTO receiver = userService.getUserByID(senderSwap.getRequestedUserId());
        Swap receiverSwap = getSwapFromDTO(receiver, swapId);

        // Set new status
        Swap.Status newStatus;
        if (status.equalsIgnoreCase("ACCEPTED")) {
            newStatus = Swap.Status.ACCEPTED;
        } else if (status.equalsIgnoreCase("DENIED")) {
            newStatus = Swap.Status.DENIED;
        } else {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        senderSwap.setStatus(newStatus);
        receiverSwap.setStatus(newStatus);
        // Save to database
        userService.updateUser(currentUserId,sender);
        userService.updateUser(receiver.getId(),receiver);
    }
}