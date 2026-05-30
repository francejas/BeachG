package com.beachg.backend.service;

import com.beachg.backend.exceptions.ResortInvalidRegisterException;
import com.beachg.backend.exceptions.ResortNotFoundException;
import com.beachg.backend.models.Resort;
import com.beachg.backend.repositories.ResortRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResortService {

    private final ResortRepository resortRepository;

    public List<Resort> getAll() {
        return resortRepository.findAll();
    }

    public Resort getResortById(Long id) {
        return resortRepository.findById(id)
                .orElseThrow(() ->
                        new ResortNotFoundException("Resort with id " + id + " not found"));
    }

    public Resort getResortByName(String name) {
        return resortRepository.findByName(name)
                .orElseThrow(() ->
                        new ResortNotFoundException("Resort with name " + name + " not found"));
    }

    public Resort registerResort(Resort resort) {
        if (resort.getIdResort() != null && resortRepository.existsById(resort.getIdResort())) {
            throw new ResortInvalidRegisterException("Resort with id " + resort.getIdResort() + " already exists");
        }

        if (resortRepository.findByName(resort.getName()).isPresent()) {
            throw new ResortInvalidRegisterException("Resort with name " + resort.getName() + " already exists");
        }

        return resortRepository.save(resort);
    }

    public Resort updateResort(Long resortId, Resort resortData) {
        Resort resort = this.getResortById(resortId);

        resort.setName(resortData.getName());
        resort.setLocation(resortData.getLocation());
        resort.setAdminEmail(resortData.getAdminEmail());
        resort.setPasswordHash(resortData.getPasswordHash());
        resort.setCoverPhotoUrl(resortData.getCoverPhotoUrl());
        resort.setRentalUnits(resortData.getRentalUnits());
        resort.setAmenities(resortData.getAmenities());

        return resortRepository.save(resort);
    }

    public Resort toInactive(Long id) {
        Resort resort = this.getResortById(id);

        resort.setActive(false);

        return resortRepository.save(resort);
    }

    public Resort toActive(Long id) {
        Resort resort = this.getResortById(id);

        resort.setActive(true);

        return resortRepository.save(resort);
    }



}
