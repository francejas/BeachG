package com.beachg.backend.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "resort")
public class Resort {
        ///CHEQUEAR CLASE
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long idResort;

        private String name;
        private String ubication;

        @OneToMany(mappedBy = "service")
        private List<Service> servicesList;
}
