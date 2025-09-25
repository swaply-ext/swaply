package com.swaply.backend.domain.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import org.springframework.data.annotation.Id;

@Container(containerName = "swaply")
public class Cancion {

    @Id
    private String id;

    @PartitionKey
    private String artista;

    private String titulo;
    private String genero;
    private int duracionSegundos;

    public Cancion() {}

    public Cancion(String id, String artista, String titulo, String genero, int duracionSegundos) {
        this.id = id;
        this.artista = artista;
        this.titulo = titulo;
        this.genero = genero;
        this.duracionSegundos = duracionSegundos;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getArtista() { return artista; }
    public void setArtista(String artista) { this.artista = artista; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public int getDuracionSegundos() { return duracionSegundos; }
    public void setDuracionSegundos(int duracionSegundos) { this.duracionSegundos = duracionSegundos; }
}
