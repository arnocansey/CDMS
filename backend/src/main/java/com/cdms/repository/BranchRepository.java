package com.cdms.repository;

import com.cdms.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByChurchId(Long churchId);
    List<Branch> findByDistrictId(Long districtId);
    Optional<Branch> findByChurchIdAndCode(Long churchId, String code);
}
