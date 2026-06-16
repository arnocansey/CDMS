package com.cdms.repository;

import com.cdms.entity.ChurchTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChurchTransferRepository extends JpaRepository<ChurchTransfer, Long> {
    List<ChurchTransfer> findByFromChurchId(Long churchId);
    List<ChurchTransfer> findByToChurchId(Long churchId);
    List<ChurchTransfer> findByStatus(String status);
    List<ChurchTransfer> findByMemberId(Long memberId);
}
