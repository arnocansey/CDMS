package com.cdms.repository;

import com.cdms.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    boolean existsByName(String name);
    boolean existsByNameAndChurchId(String name, Long churchId);
    List<Department> findByChurchId(Long churchId);
}
