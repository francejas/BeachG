package com.beachg.backend.services;

import com.beachg.backend.models.RentalUnit;
import com.beachg.backend.models.Resort;
import com.beachg.backend.repositories.RentalUnitRepository;
import com.beachg.backend.repositories.ResortRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RentalUnitService {

    private final RentalUnitRepository rentalUnitRepository;
    private final ResortRepository resortRepository;

    public RentalUnitService(RentalUnitRepository rentalUnitRepository, ResortRepository resortRepository) {
        this.rentalUnitRepository = rentalUnitRepository;
        this.resortRepository = resortRepository;
    }

    // Crea una nueva unidad vinculándola al balneario correspondiente
    public RentalUnit createRentalUnit(RentalUnit unit, Long idResort) {
        Resort resort = resortRepository.findById(idResort)
                .orElseThrow(() -> new RuntimeException("Resort no encontrado"));

        unit.setResort(resort);
        unit.setIsBlocked(false); // Por defecto se crea desbloqueada
        return rentalUnitRepository.save(unit);
    }

    // Modifica solo el precio diario
    public RentalUnit updatePrice(Long idRentalUnit, Double newPrice) {
        RentalUnit unit = rentalUnitRepository.findById(idRentalUnit)
                .orElseThrow(() -> new RuntimeException("Unidad no encontrada"));

        unit.setDailyPrice(newPrice);
        return rentalUnitRepository.save(unit);
    }

    // Bloquea o desbloquea la unidad
    public RentalUnit updateBlockStatus(Long idRentalUnit, Boolean isBlocked) {
        RentalUnit unit = rentalUnitRepository.findById(idRentalUnit)
                .orElseThrow(() -> new RuntimeException("Unidad no encontrada"));

        unit.setIsBlocked(isBlocked);
        return rentalUnitRepository.save(unit);
    }

    // Lista todas las unidades
    public List<RentalUnit> getAllRentalUnits() {
        return rentalUnitRepository.findAll();
    }
}