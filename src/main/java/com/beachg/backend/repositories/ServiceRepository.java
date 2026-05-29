package com.beachg.backend.repositories;

import com.beachg.backend.models.ResortService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<ResortService, Long> {

}
