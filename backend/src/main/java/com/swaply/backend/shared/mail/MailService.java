package com.swaply.backend.shared.mail;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import java.util.HashMap;
import java.util.Map;

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

    private void sendHtmlEmail(String to, String subject, String htmlBody, Map<String, Resource> inlineImages) {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            messageHelper.setTo(to);
            messageHelper.setSubject(subject);
            messageHelper.setText(htmlBody, true);

            if (inlineImages != null) {
                for (Map.Entry<String, Resource> entry : inlineImages.entrySet()) {
                    messageHelper.addInline(entry.getKey(), entry.getValue());
                }
            }

            javaMailSender.send(mimeMessage);

        } catch (MessagingException e) {
            throw new RuntimeException("Error al enviar el email: " + e.getMessage(), e);
        }
    }

    public void sendVerificationCode(String email, Integer code) {
        Context context = new Context();
        context.setVariable("code", code);
        String htmlBody = templateEngine.process("email/RegisterVerificationCode", context);
        Map<String, Resource> inlineImages = new HashMap<>();
        inlineImages.put("logo_swp_invert", new ClassPathResource("templates/email/images/logo_swp_invert.png"));
        inlineImages.put("swaply_hands", new ClassPathResource("templates/email/images/Swaply-hands.png"));
        sendHtmlEmail(email, "Tu Código de Verificación de Swaply", htmlBody, inlineImages);
    }

    public void sendPasswordResetEmail(String email, String resetUrl) {
        Context context = new Context();
        context.setVariable("resetUrl", resetUrl);
        String htmlBody = templateEngine.process("email/PasswordReset.html", context);
        Map<String, Resource> inlineImages = new HashMap<>();
        inlineImages.put("logo_swp_invert", new ClassPathResource("templates/email/images/logo_swp_invert.png"));
        inlineImages.put("swaply_hands", new ClassPathResource("templates/email/images/Swaply-hands.png"));
        sendHtmlEmail(email, "Restablece tu contraseña de Swaply", htmlBody, inlineImages);
    }

    public void sendSwapRequestEmail(String toEmail, String receiverName, String requesterName, String skillOffered, String skillRequested) {
        Context context = new Context();
        context.setVariable("receiverName", receiverName);
        context.setVariable("requesterName", requesterName);
        context.setVariable("skillOffered", skillOffered);
        context.setVariable("skillRequested", skillRequested);

        //Email al hacer la solicitud de swap

        String htmlBody = templateEngine.process("email/SwapRequestNotification", context);

        Map<String, Resource> inlineImages = new HashMap<>();
        inlineImages.put("logo_swp_invert", new ClassPathResource("templates/email/images/logo_swp_invert.png"));
        inlineImages.put("swaply_hands", new ClassPathResource("templates/email/images/Swaply-hands.png"));

        sendHtmlEmail(toEmail, "¡Tienes una nueva solicitud de intercambio en Swaply!", htmlBody, inlineImages);
    }
}
