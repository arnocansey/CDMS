package com.cdms.repository;

import com.cdms.entity.Fund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FundRepository extends JpaRepository<Fund, Long> {
    List<Fund> findByChurchId(Long churchId);
    List<Fund> findByFundType(String fundType);
    List<Fund> findByActiveTrue();
    List<Fund> findByChurchIdAndActiveTrue(Long churchId);
    Optional<Fund> findByName(String name);
    boolean existsByName(String name);
}
