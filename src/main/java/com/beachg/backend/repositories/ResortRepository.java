package com.beachg.backend.repositories;


import com.beachg.backend.models.Resort;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ResortRepository extends JpaRepository<Resort,Long> {
}

