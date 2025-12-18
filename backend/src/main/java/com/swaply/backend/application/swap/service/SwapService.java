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
import com.swaply.backend.shared.mail.MailService;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;

@Service
public class SwapService {

    private final UserRepository repository;
    private final SwapMapper mapper;
    private final UserService userService;
    private final MailService mailService;

    public SwapService(SwapMapper mapper, UserRepository repository, UserService userService, MailService mailService) {
        this.mapper = mapper;
        this.repository = repository;
        this.userService = userService;
        this.mailService = mailService;
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

        //Enviar email de notificación
                try {
            UserDTO senderDto = userService.getUserByID(sendingUser);
            UserDTO receiverDto = userService.getUserByUsername(dto.getRequestedUsername());

            mailService.sendSwapRequestEmail(
                receiverDto.getEmail(),       
                receiverDto.getName(),        
                senderDto.getName(),          
                dto.getSkill(),             
                dto.getInterest()        
            );
            System.out.println("Notificación enviada a: " + receiverDto.getEmail());

        } catch (Exception e) {
            System.err.println("No se pudo enviar el correo de notificación: " + e.getMessage());
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
