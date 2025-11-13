package com.swaply.backend.shared.UserCRUD.Model;

import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;

import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Container(containerName = "swaply-container")
public class Skills {

    @Id
    String id;
    String type = "skills";

    @PartitionKey
    String name;
    String normalizedName; // este nombre es para que las busquedas no detecten mayusculas ni acentos
    Integer level;
    String category;
    String icon;
}
