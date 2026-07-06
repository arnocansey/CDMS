package com.cdms.controller;

import com.cdms.entity.District;
import com.cdms.repository.DistrictRepository;
import com.cdms.security.TenantContext;
import com.cdms.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/districts")
public class DistrictController {

    private final DistrictRepository districtRepository;

    public DistrictController(DistrictRepository districtRepository) {
        this.districtRepository = districtRepository;
    }

    @GetMapping
    public ResponseEntity<List<District>> getDistricts() {
        Long churchId = TenantContext.getChurchId();
        return ResponseEntity.ok(districtRepository.findByChurchId(churchId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<District> createDistrict(@Valid @RequestBody District district) {
        Long churchId = TenantContext.getChurchId();
        district.setChurchId(churchId);
        return ResponseEntity.ok(districtRepository.save(district));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<District> updateDistrict(@PathVariable Long id, @Valid @RequestBody District districtDetails) {
        Long churchId = TenantContext.getChurchId();
        District district = districtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("District", id));
        
        if (!district.getChurchId().equals(churchId)) {
            return ResponseEntity.status(403).build();
        }

        district.setName(districtDetails.getName());
        district.setDescription(districtDetails.getDescription());
        return ResponseEntity.ok(districtRepository.save(district));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDistrict(@PathVariable Long id) {
        Long churchId = TenantContext.getChurchId();
        District district = districtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("District", id));

        if (!district.getChurchId().equals(churchId)) {
            return ResponseEntity.status(403).build();
        }

        districtRepository.delete(district);
        return ResponseEntity.ok().build();
    }
}
