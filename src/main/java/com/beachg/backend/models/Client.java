package com.beachg.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idClient;

    private String firstName;

    private String lastName;

    @Column(unique = true)
    private String email;

    private String passwordHash;

    private String phone;

    @Column(nullable = false)
    private String role = "USER";  // "USER" o "ADMIN"

    // Relación bidireccional: Un cliente puede tener muchas reservas.
    // "mappedBy" le avisa a Spring Boot que la clave foránea ya se maneja en la clase Booking.
    @OneToMany(mappedBy = "client")
    private List<Booking> bookings;
}