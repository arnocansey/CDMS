package com.cdms.controller;

import com.cdms.entity.Branch;
import com.cdms.repository.BranchRepository;
import com.cdms.security.TenantContext;
import com.cdms.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchRepository branchRepository;

    public BranchController(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    @GetMapping
    public ResponseEntity<List<Branch>> getBranches() {
        Long churchId = TenantContext.getChurchId();
        return ResponseEntity.ok(branchRepository.findByChurchId(churchId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Branch> createBranch(@Valid @RequestBody Branch branch) {
        Long churchId = TenantContext.getChurchId();
        branch.setChurchId(churchId);
        return ResponseEntity.ok(branchRepository.save(branch));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Branch> updateBranch(@PathVariable Long id, @Valid @RequestBody Branch branchDetails) {
        Long churchId = TenantContext.getChurchId();
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", id));

        if (!branch.getChurchId().equals(churchId)) {
            return ResponseEntity.status(403).build();
        }

        branch.setName(branchDetails.getName());
        branch.setDistrictId(branchDetails.getDistrictId());
        branch.setCode(branchDetails.getCode());
        branch.setPhone(branchDetails.getPhone());
        branch.setEmail(branchDetails.getEmail());
        branch.setAddress(branchDetails.getAddress());
        branch.setCity(branchDetails.getCity());
        branch.setState(branchDetails.getState());
        branch.setZipCode(branchDetails.getZipCode());
        branch.setEnabled(branchDetails.isEnabled());

        return ResponseEntity.ok(branchRepository.save(branch));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBranch(@PathVariable Long id) {
        Long churchId = TenantContext.getChurchId();
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", id));

        if (!branch.getChurchId().equals(churchId)) {
            return ResponseEntity.status(403).build();
        }

        branchRepository.delete(branch);
        return ResponseEntity.ok().build();
    }
}
