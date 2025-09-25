package com.swaply.backend.infrastructure.config;

import com.azure.cosmos.CosmosClient;
import com.azure.cosmos.CosmosClientBuilder;
import com.azure.security.keyvault.secrets.SecretClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CosmosConfig {

    private final SecretClient secretClient;

    public CosmosConfig(SecretClient secretClient) {
        this.secretClient = secretClient;
    }

    @Bean
    public CosmosClient cosmosClient() {
        // Obtener la key de Cosmos DB desde Key Vault
        String cosmosKey = secretClient.getSecret("cosmos-readwrite-key").getValue();
        String cosmosEndpoint = "https://swaply-db.documents.azure.com:443/";

        // Crear cliente de Cosmos DB
        return new CosmosClientBuilder()
                .endpoint(cosmosEndpoint)
                .key(cosmosKey)
                .buildClient();
    }
}