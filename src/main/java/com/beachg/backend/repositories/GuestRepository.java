package com.beachg.backend.repositories;

import com.beachg.backend.models.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {

    // Método nuevo para buscar al invitado por su código exacto
    Optional<Guest> findByQrToken(String qrToken);
}