package com.swaply.backend.application.swap.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import com.swaply.backend.application.auth.exception.SwapNotFoundException;
import org.springframework.stereotype.Service;

import com.swaply.backend.application.swap.SwapMapper;
import com.swaply.backend.application.swap.dto.SwapDTO;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.dto.UserDTO;
import com.swaply.backend.shared.UserCRUD.Model.Swap;
import com.swaply.backend.shared.mail.MailService;

@Service
public class SwapService {

    private final SwapMapper mapper;
    private final UserService userService;
    private final MailService mailService;

    public SwapService(SwapMapper mapper, UserService userService, MailService mailService) {
        this.mapper = mapper;
        this.userService = userService;
        this.mailService = mailService;
    }

    public Swap createSwap(String sendingUser, SwapDTO dto) {
        String id = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        Swap sentSwap = mapper.toEntity(dto);
        sentSwap.setStatus(Swap.Status.STANDBY);
        sentSwap.setIsRequester(true);
        sentSwap.setId(id);
        sentSwap.setRequestedUserId(userService.getUserByUsername(dto.getRequestedUsername()).getId());
        sentSwap.setCreatedAt(now);

        UserDTO sender = userService.getUserByID(sendingUser);

        if (sender.getSwaps() == null) {
            sender.setSwaps(new ArrayList<>());
        }
        sender.getSwaps().add(sentSwap);
        userService.updateUser(sender.getId(), sender);

        Swap receivedSwap = mapper.toEntity(invertSwap(dto));
        receivedSwap.setStatus(Swap.Status.STANDBY);
        receivedSwap.setIsRequester(false);
        receivedSwap.setId(id);
        receivedSwap.setRequestedUserId(sendingUser);
        receivedSwap.setCreatedAt(now);

        UserDTO receiver = userService.getUserByID(sentSwap.getRequestedUserId());
        if (receiver.getSwaps() == null) {
            receiver.setSwaps(new ArrayList<>());
        }
        receiver.getSwaps().add(receivedSwap);
        userService.updateUser(receiver.getId(), receiver);

        // Enviar email de notificación
        try {
            UserDTO senderDto = userService.getUserByID(sendingUser);
            UserDTO receiverDto = userService.getUserByUsername(dto.getRequestedUsername());

            mailService.sendSwapRequestEmail(
                    receiverDto.getEmail(),
                    receiverDto.getName(),
                    senderDto.getName(),
                    dto.getSkill(),
                    dto.getInterest());
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

    public List<Swap> getAllSwaps(String id) {
        UserDTO userSwap = userService.getUserByID(id);
        List<Swap> listaSwaps = userSwap.getSwaps();

        if (listaSwaps == null || listaSwaps.isEmpty()) {
            return new ArrayList<>();
        }

        List<Swap> swapsOrdenados = new ArrayList<>(listaSwaps);
        swapsOrdenados.sort(
                Comparator.comparing(Swap::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())).reversed());
        return swapsOrdenados;
    }

    public Swap getNextSwap(String id) {
        UserDTO userSwap = userService.getUserByID(id);
        Swap nextSwap = userSwap.getSwaps().stream()
                .filter(l -> l.getStatus() == Swap.Status.STANDBY)
                .filter(l -> !l.getIsRequester())
                .findFirst()
                .orElseThrow(() -> new SwapNotFoundException("Swap not found"));
        return nextSwap;
    }

    public Swap getSwapFromDTO(UserDTO userSwap, String swapId) {
        Swap swap = userSwap.getSwaps().stream()
                .filter(s -> s.getId().equals(swapId))
                .findFirst()
                .orElseThrow(() -> new SwapNotFoundException("Swap not found"));
        return swap;
    }

    public void updateSwapStatus(String swapId, String status, String currentUserId) {
        // get sender
        UserDTO sender = userService.getUserByID(currentUserId);
        Swap senderSwap = getSwapFromDTO(sender, swapId);

        // get receiver
        UserDTO receiver = userService.getUserByID(senderSwap.getRequestedUserId());
        Swap receiverSwap = getSwapFromDTO(receiver, swapId);

        // Set new status
        Swap.Status newStatus;
        if (!status.equalsIgnoreCase("ACCEPTED") && !status.equalsIgnoreCase("DENIED")) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        if (status.equalsIgnoreCase("ACCEPTED")) {
            newStatus = Swap.Status.ACCEPTED;
        } else {
            newStatus = Swap.Status.DENIED;
        }

        senderSwap.setStatus(newStatus);
        receiverSwap.setStatus(newStatus);
        // Save to database
        userService.updateUser(currentUserId, sender);
        userService.updateUser(receiver.getId(), receiver);
    }
}