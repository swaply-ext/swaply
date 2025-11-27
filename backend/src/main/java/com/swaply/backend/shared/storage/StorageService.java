package com.swaply.backend.shared.storage;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class StorageService {

    private final BlobContainerClient containerClient;

    // Key Vault inyectará 'azure-storage-connection-string' aquí automáticamente
    public StorageService(@Value("${azure-storage-connection-string}") String connectionString,
                          @Value("${azure.storage.container-name}") String containerName) {
        
        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();
        
        this.containerClient = blobServiceClient.getBlobContainerClient(containerName);
    }

    public String uploadFile(MultipartFile file) throws IOException {
        // 1. Generar nombre único
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".jpg";
        String fileName = UUID.randomUUID().toString() + extension;

        BlobClient blobClient = containerClient.getBlobClient(fileName);

        // 2. Subir al contenedor PRIVADO
        blobClient.upload(file.getInputStream(), file.getSize(), true);

        // 3. Generar SAS Token (Permiso de lectura segura temporal)
        // Esto permite ver la foto aunque el storage sea privado
        BlobSasPermission permission = new BlobSasPermission().setReadPermission(true);
        
        // Validez de 100 años para enlace permanente
        OffsetDateTime expiryTime = OffsetDateTime.now().plusYears(100);
        
        BlobServiceSasSignatureValues values = new BlobServiceSasSignatureValues(expiryTime, permission)
                .setStartTime(OffsetDateTime.now().minusMinutes(5));

        String sasToken = blobClient.generateSas(values);

        // 4. Devolver URL firmada: https://azure.../foto.jpg?sig=...
        return blobClient.getBlobUrl() + "?" + sasToken;
    }
}