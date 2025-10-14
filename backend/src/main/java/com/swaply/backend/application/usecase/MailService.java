package com.swaply.backend.application.usecase;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.swaply.backend.infrastructure.components.MailComponent;

import jakarta.mail.internet.InternetAddress;

@Service
public class MailService {

    private final MailComponent mailComponent;

    @Autowired
    public MailService(MailComponent mailComponent) {
        this.mailComponent = mailComponent;
    }

    public void sendEmail(String email, String msg) {
        mailComponent.sendMessage(email, msg);
    }

}