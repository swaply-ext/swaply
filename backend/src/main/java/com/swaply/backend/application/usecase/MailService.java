package com.swaply.backend.application.usecase;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.swaply.backend.application.dto.MailDTO;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class MailService {

    private final JavaMailSender javaMailSender;

    public MailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;

        if (javaMailSender instanceof JavaMailSenderImpl impl) {
            String user = impl.getUsername();
            if (user == null || user.isBlank()) {
                throw new IllegalStateException("El username SMTP no está configurado.");
            }
        } else {
            throw new IllegalStateException("JavaMailSender no es JavaMailSenderImpl.");
        }
    }

    public void sendMessage(MailDTO mail) {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true,
                    java.nio.charset.StandardCharsets.UTF_8.name());

            helper.setTo(mail.getEmail());
            helper.setSubject(mail.getSubject());
            helper.setText(mail.getSample(), true);

            javaMailSender.send(mimeMessage);

        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    public void sendPasswordResetEmail(String email, String fullUrl) {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true,
                    java.nio.charset.StandardCharsets.UTF_8.name());
            helper.setTo(email);
            helper.setSubject("Url de recovery password");
            helper.setText("<h1>Url de recovery password</h1><br><p>" +
                    org.springframework.web.util.HtmlUtils.htmlEscape(fullUrl) + "</p>", true);
            javaMailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}