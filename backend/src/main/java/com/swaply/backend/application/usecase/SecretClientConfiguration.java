package com.swaply.backend.application.usecase;

import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.security.keyvault.secrets.SecretClient;
import com.azure.security.keyvault.secrets.SecretClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecretClientConfiguration {

    @Value("${keyVault.endpoint}")
    private String vaultEndpoint;    

    @Bean
    public SecretClient createSecretClient() {
        return new SecretClientBuilder()
            .vaultUrl(vaultEndpoint)
            .credential(new DefaultAzureCredentialBuilder().build())
            .buildClient();
    }
}
