package com.beachg.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long idClient;

    private String firstName;

    private String lastName;

    @Column(unique = true)
    private String email;

    private String passwordHash;

    private String phone;

    // Relación bidireccional: Un cliente puede tener muchas reservas.
    // "mappedBy" le avisa a Spring Boot que la clave foránea ya se maneja en la clase Booking.
    @OneToMany(mappedBy = "client")
    private List<Booking> bookings;
}