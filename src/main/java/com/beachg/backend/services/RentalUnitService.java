package com.beachg.backend.services;

import com.beachg.backend.dtos.RentalUnitRequest;
import com.beachg.backend.dtos.RentalUnitResponse;
import com.beachg.backend.models.RentalUnit;
import com.beachg.backend.models.Resort;
import com.beachg.backend.repositories.RentalUnitRepository;
import com.beachg.backend.repositories.ResortRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RentalUnitService {

    private final RentalUnitRepository rentalUnitRepository;
    private final ResortRepository resortRepository;

    public RentalUnitResponse createRentalUnit(RentalUnitRequest request) {
        Resort resort = resortRepository.findById(request.resortId())
                .orElseThrow(() -> new RuntimeException("Resort no encontrado"));

        RentalUnit unit = new RentalUnit();
        unit.setType(request.type());
        unit.setIdentifier(request.identifier());
        unit.setDailyPrice(request.dailyPrice());
        unit.setIsBlocked(request.isBlocked() != null ? request.isBlocked() : false);
        unit.setResort(resort);

        return mapToResponse(rentalUnitRepository.save(unit));
    }

    public List<RentalUnitResponse> getAllRentalUnits() {
        return rentalUnitRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public RentalUnitResponse updatePrice(Long idRentalUnit, Double newPrice) {
        RentalUnit unit = rentalUnitRepository.findById(idRentalUnit)
                .orElseThrow(() -> new RuntimeException("Unidad no encontrada"));

        unit.setDailyPrice(newPrice);
        return mapToResponse(rentalUnitRepository.save(unit));
    }

    public RentalUnitResponse updateBlockStatus(Long idRentalUnit, Boolean isBlocked) {
        RentalUnit unit = rentalUnitRepository.findById(idRentalUnit)
                .orElseThrow(() -> new RuntimeException("Unidad no encontrada"));

        unit.setIsBlocked(isBlocked);
        return mapToResponse(rentalUnitRepository.save(unit));
    }

    // MAPPER interno: Convierte la entidad de BD al DTO limpio
    private RentalUnitResponse mapToResponse(RentalUnit unit) {
        return new RentalUnitResponse(
                unit.getIdRentalUnit(),
                unit.getType(),
                unit.getIdentifier(),
                unit.getDailyPrice(),
                unit.getIsBlocked()
        );
    }
}