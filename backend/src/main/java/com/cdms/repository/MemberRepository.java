package com.cdms.repository;

import com.cdms.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Member> findByChurchId(Long churchId);
    Page<Member> findByChurchId(Long churchId, Pageable pageable);
    boolean existsByEmailAndChurchId(String email, Long churchId);
    
    @Query("SELECT m FROM Member m WHERE m.active = true")
    List<Member> findAllActiveMembers();
    
    @Query("SELECT m FROM Member m WHERE m.churchId = :churchId AND m.active = true")
    List<Member> findActiveMembersByChurchId(@Param("churchId") Long churchId);
    
    @Query("SELECT m FROM Member m WHERE LOWER(m.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Member> searchMembers(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT m FROM Member m WHERE m.churchId = :churchId AND (LOWER(m.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Member> searchMembersByChurchId(@Param("churchId") Long churchId, @Param("search") String search, Pageable pageable);
    
    @Query("SELECT COUNT(m) FROM Member m WHERE m.active = true")
    long countActiveMembers();
    
    @Query("SELECT COUNT(m) FROM Member m WHERE m.churchId = :churchId AND m.active = true")
    long countActiveMembersByChurchId(@Param("churchId") Long churchId);
    
    @Query("SELECT m FROM Member m WHERE m.department.id = :departmentId")
    List<Member> findByDepartmentId(@Param("departmentId") Long departmentId);
    
    @Query("SELECT m FROM Member m WHERE m.churchId = :churchId AND m.department.id = :departmentId")
    List<Member> findByChurchIdAndDepartmentId(@Param("churchId") Long churchId, @Param("departmentId") Long departmentId);
}
