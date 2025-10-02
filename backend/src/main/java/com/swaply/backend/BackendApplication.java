package com.swaply.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.azure.spring.data.cosmos.repository.config.EnableCosmosRepositories;
import org.springframework.context.annotation.Configuration;

@SpringBootApplication

public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}


