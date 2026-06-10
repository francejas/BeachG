package com.beachg.backend.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Guest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idGuest;

    //cambiar a firstname y lastname
    private String fullName;

    @Column(unique = true)
    private String qrToken;

    private Boolean isEntryValidated;

    @ManyToOne
    @JoinColumn(name = "id_booking")
    private Booking booking;
}