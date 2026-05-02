package com.beachg.backend.models;

import lombok.Data;

@Data // Esta es la magia de Lombok: te crea los getters, setters y constructores invisiblemente.
public class Balneario {

    private Integer idBalneario;
    private String nombre;
    private String direccion;
    private String emailAdmin;
    private String passwordHash;
    private String fotoPortadaUrl;

}