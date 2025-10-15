package com.swaply.backend.application.usecase;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;


import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

@Service
public class MailService {

    private final JavaMailSender javaMailSender;
    private final String sender;

    public MailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;

        if (javaMailSender instanceof JavaMailSenderImpl impl) {
            String user = impl.getUsername();
            if (user == null || user.isBlank()) {
                throw new IllegalStateException("El username SMTP no está configurado.");
            }
            this.sender = user;
        } else {
            throw new IllegalStateException("JavaMailSender no es JavaMailSenderImpl.");
        }
    }

    public void sendMessage(String email, String msg) {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true,
                    java.nio.charset.StandardCharsets.UTF_8.name());
            helper.setTo(email);
            helper.setSubject("Prueba de correo");
            helper.setText("<h1>Correo de prueba</h1><br><p>" +
                    org.springframework.web.util.HtmlUtils.htmlEscape(msg) + "</p>", true);
            helper.setFrom(sender);
            javaMailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

}