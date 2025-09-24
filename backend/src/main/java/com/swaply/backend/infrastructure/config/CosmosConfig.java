package com.swaply.backend.infrastructure.config;

import com.azure.spring.data.cosmos.repository.config.EnableCosmosRepositories;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCosmosRepositories(basePackages = "com.swaply.backend.domain.repository")
public class CosmosConfig {
}
