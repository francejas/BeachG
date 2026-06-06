package com.beachg.backend.services;

import com.beachg.backend.repositories.BookingRepository;
import com.beachg.backend.repositories.ClientRepository;
import com.beachg.backend.repositories.GuestRepository;
import com.beachg.backend.repositories.RentalUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ClientRepository clientRepository;
    private final RentalUnitRepository rentalUnitRepository;
    private final GuestRepository guestRepository;

    // ACLARACION: Cree 2 metodos, uno publico y otro privado, el publico para reutilizarlo
    // en otra clase y el privado para esta, cosa que las responsabilidades esten bien separadas.
    public double getCalculatedPrice(LocalDate start, LocalDate end, Double dailyPrice) {
        return calculateTotalPrice(start, end, dailyPrice);
    }

    private double calculateTotalPrice(LocalDate start, LocalDate end, Double dailyPrice) {
        long days = ChronoUnit.DAYS.between(start, end);
        return days * dailyPrice;
    }
}