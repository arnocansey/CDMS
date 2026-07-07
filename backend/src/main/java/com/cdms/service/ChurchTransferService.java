package com.cdms.service;

import com.cdms.entity.ChurchTransfer;
import com.cdms.entity.Member;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.ChurchTransferRepository;
import com.cdms.repository.MemberRepository;
import com.cdms.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChurchTransferService {

    private final ChurchTransferRepository churchTransferRepository;
    private final MemberRepository memberRepository;
    private final AuditLogService auditLogService;

    public ChurchTransferService(ChurchTransferRepository churchTransferRepository,
                                  MemberRepository memberRepository,
                                  AuditLogService auditLogService) {
        this.churchTransferRepository = churchTransferRepository;
        this.memberRepository = memberRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ChurchTransfer requestTransfer(Long memberId, Long toChurchId, String reason) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", memberId));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && !member.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("Member", memberId);
        }

        ChurchTransfer transfer = new ChurchTransfer();
        transfer.setMember(member);
        transfer.setFromChurchId(member.getChurchId());
        transfer.setToChurchId(toChurchId);
        transfer.setTransferDate(LocalDate.now());
        transfer.setReason(reason);
        transfer.setStatus("PENDING");
        transfer.setRequestedBy(member.getEmail());

        ChurchTransfer saved = churchTransferRepository.save(transfer);

        auditLogService.log(null, "TRANSFER_REQUESTED", "ChurchTransfer", saved.getId());

        return saved;
    }

    @Transactional
    public ChurchTransfer approveTransfer(Long transferId, String approvedBy) {
        ChurchTransfer transfer = churchTransferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("ChurchTransfer", transferId));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && !transfer.getToChurchId().equals(churchId) && !transfer.getFromChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("ChurchTransfer", transferId);
        }

        if (!"PENDING".equals(transfer.getStatus())) {
            throw new BadRequestException("Transfer is not in PENDING status");
        }

        Member member = transfer.getMember();
        member.setChurchId(transfer.getToChurchId());
        memberRepository.save(member);

        transfer.setStatus("COMPLETED");
        transfer.setApprovedBy(approvedBy);

        ChurchTransfer saved = churchTransferRepository.save(transfer);

        auditLogService.log(null, "TRANSFER_APPROVED", "ChurchTransfer", saved.getId());

        return saved;
    }

    @Transactional
    public ChurchTransfer rejectTransfer(Long transferId, String reason) {
        ChurchTransfer transfer = churchTransferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("ChurchTransfer", transferId));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && !transfer.getToChurchId().equals(churchId) && !transfer.getFromChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("ChurchTransfer", transferId);
        }

        if (!"PENDING".equals(transfer.getStatus())) {
            throw new BadRequestException("Transfer is not in PENDING status");
        }

        transfer.setStatus("REJECTED");
        transfer.setNotes(reason);

        ChurchTransfer saved = churchTransferRepository.save(transfer);

        auditLogService.log(null, "TRANSFER_REJECTED", "ChurchTransfer", saved.getId());

        return saved;
    }

    public List<ChurchTransfer> getTransfers(Long churchId) {
        List<ChurchTransfer> fromTransfers = churchTransferRepository.findByFromChurchId(churchId);
        List<ChurchTransfer> toTransfers = churchTransferRepository.findByToChurchId(churchId);

        List<ChurchTransfer> all = new ArrayList<>(fromTransfers);
        for (ChurchTransfer t : toTransfers) {
            if (all.stream().noneMatch(existing -> existing.getId().equals(t.getId()))) {
                all.add(t);
            }
        }
        return all;
    }

    public List<ChurchTransfer> getPendingTransfers(Long churchId) {
        return getTransfers(churchId).stream()
                .filter(t -> "PENDING".equals(t.getStatus()))
                .collect(Collectors.toList());
    }
}
