package com.beachg.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class Amenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAmenity;

    private String name;

    @ManyToMany(mappedBy = "amenities")
    private List<Resort> resorts;
}