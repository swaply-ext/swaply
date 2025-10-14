package com.swaply.backend.infrastructure.components;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;



@Component
public class MailComponent {
    private final JavaMailSender javaMailSender;

    // Usar variable de entorno a través de la propiedad de Spring Boot
    @Value("${spring.mail.username}")
    private String sender;

    public MailComponent(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void sendMessage(String email, String msg){
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setTo(email);
            helper.setSubject("Prueba de correo");
            helper.setText("<h1>Correo de prueba</h1><br><p>" + msg + "</p>", true);
            helper.setFrom(sender);
            javaMailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}
