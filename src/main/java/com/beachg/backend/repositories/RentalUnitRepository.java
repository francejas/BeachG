package com.beachg.backend.repositories;

import com.beachg.backend.models.RentalUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RentalUnitRepository extends JpaRepository<RentalUnit, Long> {
}