package com.swaply.backend.shared.mail;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class MailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    public MailService(JavaMailSender javaMailSender, TemplateEngine templateEngine) {
        this.javaMailSender = javaMailSender;
        this.templateEngine = templateEngine;
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            messageHelper.setTo(to);
            messageHelper.setSubject(subject);
            messageHelper.setText(htmlBody, true);


            javaMailSender.send(mimeMessage);

        } catch (MessagingException e) {
            throw new RuntimeException("Error al enviar el email: " + e.getMessage(), e);
        }
    }

    public void sendVerificationCode(String email, String code) {
        Context context = new Context();
        context.setVariable("code", code);
        String htmlBody = templateEngine.process("email/RegisterVerificationCode", context);
        sendHtmlEmail(email, "Tu Código de Verificación de Swaply", htmlBody);
    }

    public void sendPasswordResetEmail(String to, String resetUrl) {
        Context context = new Context();
        context.setVariable("resetUrl", resetUrl);
        String htmlBody = templateEngine.process("email/PasswordReset.html", context);
        sendHtmlEmail(to, "Restablece tu contraseña de Swaply", htmlBody);
    }

    
}