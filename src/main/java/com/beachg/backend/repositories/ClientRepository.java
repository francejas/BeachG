package com.beachg.backend.repositories;

import com.beachg.backend.models.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    // Metodo personalizado: Spring Boot automáticamente arma la consulta SQL
    // "SELECT * FROM client WHERE email = ?" solo con leer el nombre de este metodoo
    Optional<Client> findByEmail(String email);

}