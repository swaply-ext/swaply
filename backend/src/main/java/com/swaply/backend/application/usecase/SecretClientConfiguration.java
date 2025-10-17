package com.swaply.backend.application.usecase;

import com.azure.identity.DefaultAzureCredential;
import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.security.keyvault.secrets.SecretClient;
import com.azure.security.keyvault.secrets.SecretClientBuilder;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Crea el TokenCredential (DefaultAzureCredential) y el SecretClient para Key Vault.
 * DefaultAzureCredential funciona con az login en local y Managed Identity/SP en Azure.
 */
@Configuration
public class SecretClientConfiguration {

    @Value("${keyvault.url}")
    private String keyVaultUrl;

    @Bean
    public DefaultAzureCredential defaultAzureCredential() {
        // Puedes pasar opciones (p.ej. ManagedIdentityClientId) si usas user-assigned MI
        return new DefaultAzureCredentialBuilder().build();
    }

    @Bean
    public SecretClient secretClient(DefaultAzureCredential credential) {
        return new SecretClientBuilder()
                .vaultUrl(keyVaultUrl)
                .credential(credential)
                .buildClient();
    }
    @Bean
    public JavaMailSender javaMailSender(SecretClient secretClient) {
    JavaMailSenderImpl sender = new JavaMailSenderImpl();
    sender.setHost("smtp.gmail.com"); // o lee "smtp-host" desde KV
    sender.setPort(587);              // 587 = STARTTLS (recomendado)
    sender.setUsername(secretClient.getSecret("smtp-username").getValue());
    sender.setPassword(secretClient.getSecret("smtp-password").getValue());

    Properties p = sender.getJavaMailProperties();
    p.put("mail.smtp.auth", "true");
    p.put("mail.smtp.starttls.enable", "true");      // <-- imprescindible para 587
    p.put("mail.smtp.starttls.required", "true");    // <-- opcional pero recomendable
    // Timeouts para evitar bloqueos:
    p.put("mail.smtp.connectiontimeout", "5000");
    p.put("mail.smtp.timeout", "5000");
    p.put("mail.smtp.writetimeout", "5000");

    return sender;
}
}