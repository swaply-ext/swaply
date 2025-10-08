package com.swaply.backend.infrastructure.config;

import com.azure.cosmos.ConsistencyLevel;
import com.azure.cosmos.CosmosClientBuilder;
import com.azure.core.exception.ResourceNotFoundException;
import com.azure.security.keyvault.secrets.SecretClient;
import com.azure.security.keyvault.secrets.models.KeyVaultSecret;

import com.azure.spring.data.cosmos.config.AbstractCosmosConfiguration;
import com.azure.spring.data.cosmos.config.CosmosConfig;
import com.azure.spring.data.cosmos.repository.config.EnableCosmosRepositories;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.BeanCreationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configura Cosmos + repos. Al extender AbstractCosmosConfiguration y exponer
 * un
 * CosmosClientBuilder, Spring Data Cosmos (v5.x) registra automáticamente el
 * bean cosmosTemplate.
 */
@Configuration
@EnableCosmosRepositories(basePackages = "com.swaply.backend.domain.repository")
public class CosmosDBConfig extends AbstractCosmosConfiguration {

    private static final Logger log = LoggerFactory.getLogger(CosmosDBConfig.class);

    @Value("${cosmos.database}")
    private String databaseName;

    // Nombres de secretos en Key Vault
    @Value("${secrets.cosmos-endpoint}")
    private String endpointSecretName;

    @Value("${secrets.cosmos-key}")
    private String keySecretName;

    // Fallback por propiedades (opcional)
    @Value("${cosmos.endpoint:}")
    private String endpointProp;

    @Value("${cosmos.key:}")
    private String keyProp;

    @Bean
    public CosmosClientBuilder cosmosClientBuilder(SecretClient secretClient) {
        String endpoint = null;
        String key = null;

        // 1) Intenta leer de Key Vault
        try {
            KeyVaultSecret endpointSecret = secretClient.getSecret(endpointSecretName);
            KeyVaultSecret keySecret = secretClient.getSecret(keySecretName);
            endpoint = endpointSecret.getValue();
            key = keySecret.getValue();
        } catch (ResourceNotFoundException rnfe) {
            log.warn("Secreto no encontrado en Key Vault ({} / {}). Intentando fallback.",
                    endpointSecretName, keySecretName, rnfe);
        } catch (Exception ex) {
            log.warn("No se pudo leer secretos de Key Vault. Intentando fallback.", ex);
        }

        // 2) Fallback por propiedades
        if (isBlank(endpoint) && !isBlank(endpointProp))
            endpoint = endpointProp;
        if (isBlank(key) && !isBlank(keyProp))
            key = keyProp;

        // 3) Fallback por variables de entorno
        if (isBlank(endpoint))
            endpoint = System.getenv("COSMOS_ENDPOINT");
        if (isBlank(key))
            key = System.getenv("COSMOS_KEY");

        // 4) Validación final
        if (isBlank(endpoint) || isBlank(key)) {
            throw new BeanCreationException(
                    "No se pudo obtener endpoint/key de Cosmos ni desde Key Vault ni desde fallback " +
                            "(props/env). Revisa: secretos en Key Vault, permisos RBAC, y/o define cosmos.endpoint/cosmos.key "
                            +
                            "o COSMOS_ENDPOINT/COSMOS_KEY.");
        }

        return new CosmosClientBuilder()
                .gatewayMode()
                .endpoint(endpoint)
                .key(key)
                .consistencyLevel(ConsistencyLevel.SESSION);
    }

    @Bean
    public CosmosConfig cosmosConfig() {
        return CosmosConfig.builder()
                .enableQueryMetrics(true)
                .build();
    }

    @Override
    protected String getDatabaseName() {
        return databaseName;
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}