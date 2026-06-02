package com.beachg.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Resorts")
public class Resort {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id")
        private Long idResort;

        private String name;

        private String location;

        @Column(unique = true)
        private String adminEmail;

        @JsonIgnore
        private String passwordHash;

        private String coverPhotoUrl;

        @OneToMany(mappedBy = "resort")
        @JsonIgnore
        private List<RentalUnit> rentalUnits;

        @ManyToMany
        @JoinTable(
                name = "resorts_amenities",
                joinColumns = @JoinColumn(name = "resort_id"), // <-- El nombre real de la columna en tu script de BD
                inverseJoinColumns = @JoinColumn(name = "amenity_id") // El nombre real en tu script de BD
        )
        private List<Amenity> amenities;
}