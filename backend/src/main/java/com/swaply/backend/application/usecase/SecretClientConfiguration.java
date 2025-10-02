package com.swaply.backend.application.usecase;

import com.azure.identity.DefaultAzureCredential;
import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.security.keyvault.secrets.SecretClient;
import com.azure.security.keyvault.secrets.SecretClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
}
