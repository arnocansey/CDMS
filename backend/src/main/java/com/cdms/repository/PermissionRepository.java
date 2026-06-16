package com.cdms.repository;

import com.cdms.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    List<Permission> findByChurchId(Long churchId);
    List<Permission> findByChurchIdAndRole(Long churchId, String role);
    List<Permission> findByChurchIdAndResource(Long churchId, String resource);
    Optional<Permission> findByChurchIdAndRoleAndResourceAndAction(Long churchId, String role, String resource, String action);
    void deleteByChurchIdAndRole(Long churchId, String role);
    void deleteByChurchId(Long churchId);
}
