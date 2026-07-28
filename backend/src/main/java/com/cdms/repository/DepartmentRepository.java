package com.cdms.repository;

import com.cdms.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    boolean existsByName(String name);
    boolean existsByNameAndChurchId(String name, Long churchId);

    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.leader WHERE d.churchId = :churchId")
    List<Department> findByChurchIdWithLeader(@Param("churchId") Long churchId);

    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.leader WHERE d.id = :id")
    Optional<Department> findByIdWithLeader(@Param("id") Long id);
}
