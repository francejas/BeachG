package com.beachg.backend.repositories;


import com.beachg.backend.models.Resort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResortRepository extends JpaRepository<Resort,Long> {
    Optional<Resort> findByName(String name);
}

