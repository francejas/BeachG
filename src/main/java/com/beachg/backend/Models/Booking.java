package com.beachg.backend.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "booking")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "id_client")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "id_rental_unit")
    private RentalUnit rentalUnit;

    @OneToMany(mappedBy = "booking")
    private List<Guest> guests;
}
