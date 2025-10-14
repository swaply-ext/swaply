package com.swaply.backend.application.usecase;

import org.springframework.stereotype.Service;

import com.swaply.backend.infrastructure.components.MailComponent;

@Service
public class MailService {

    MailComponent mailComponent;

    public MailService(MailComponent mailComponent) {
        this.mailComponent = mailComponent;
    }

    public void sendEmail(String email) {
        mailComponent.sendMessage(email);
    }


}