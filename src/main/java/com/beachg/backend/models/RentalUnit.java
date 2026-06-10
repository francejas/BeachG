package com.beachg.backend.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class RentalUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRentalUnit;

    @Enumerated(EnumType.STRING)
    private UnitType type;

    private String identifier;

    private Double dailyPrice;

    private Boolean isBlocked;

    @ManyToOne
    @JoinColumn(name = "id_resort")
    private Resort resort;
}