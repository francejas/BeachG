package com.beachg.backend.models;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class Resort {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idResort;

    private String name;

    private String location;

    @Column(unique = true)
    private String adminEmail;

    private String passwordHash;

    private String coverPhotoUrl;

    @OneToMany(mappedBy = "resort")
    private List<RentalUnit> rentalUnits;

    @ManyToMany
    private List<Amenity> amenities;

    private boolean isActive;
}