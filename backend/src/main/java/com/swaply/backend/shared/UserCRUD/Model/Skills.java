package com.swaply.backend.shared.UserCRUD.Model;

import org.springframework.data.annotation.Id;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Container(containerName = "swaply-container")
public class Skills {
    
    @Id
    private String id;
    
    @PartitionKey
    private String type = "skills";

    private String name;
    private String category;
    private String icon;
}
