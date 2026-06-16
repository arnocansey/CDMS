package com.cdms.service;

import com.cdms.dto.ReceiptDto;
import com.cdms.entity.Member;
import com.cdms.entity.Receipt;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.MemberRepository;
import com.cdms.repository.ReceiptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReceiptService {

    private static final Logger logger = LoggerFactory.getLogger(ReceiptService.class);

    private final ReceiptRepository receiptRepository;
    private final MemberRepository memberRepository;
    private final ReceiptPdfService receiptPdfService;
    private EmailService emailService;

    public ReceiptService(ReceiptRepository receiptRepository, MemberRepository memberRepository,
                          ReceiptPdfService receiptPdfService) {
        this.receiptRepository = receiptRepository;
        this.memberRepository = memberRepository;
        this.receiptPdfService = receiptPdfService;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    public ReceiptDto generateReceipt(ReceiptDto dto) {
        Receipt receipt = new Receipt();
        receipt.setReceiptNumber("REC-" + System.currentTimeMillis());
        receipt.setAmount(dto.getAmount());
        receipt.setReceiptDate(dto.getReceiptDate() != null ? dto.getReceiptDate() : LocalDate.now());
        receipt.setContributionType(dto.getContributionType());
        receipt.setContributionId(dto.getContributionId());
        receipt.setTreasurerName(dto.getTreasurerName());
        receipt.setTreasurerSignature(dto.getTreasurerSignature());
        receipt.setNotes(dto.getNotes());
        receipt.setStatus("ISSUED");

        if (dto.getMemberId() != null) {
            Member member = memberRepository.findById(dto.getMemberId())
                    .orElseThrow(() -> new ResourceNotFoundException("Member", dto.getMemberId()));
            receipt.setMember(member);
        }

        Receipt savedReceipt = receiptRepository.save(receipt);
        return mapToDto(savedReceipt);
    }

    public ReceiptDto getReceiptById(Long id) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt", id));
        return mapToDto(receipt);
    }

    public ReceiptDto getReceiptByNumber(String number) {
        Receipt receipt = receiptRepository.findByReceiptNumber(number)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt: " + number));
        return mapToDto(receipt);
    }

    public List<ReceiptDto> getReceiptsByMember(Long memberId) {
        return receiptRepository.findByMemberId(memberId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ReceiptDto> getReceiptsByDateRange(LocalDate start, LocalDate end) {
        return receiptRepository.findByReceiptDateBetween(start, end).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ReceiptDto updateReceiptStatus(Long id, String status) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt", id));
        receipt.setStatus(status);
        Receipt updatedReceipt = receiptRepository.save(receipt);
        return mapToDto(updatedReceipt);
    }

    public void sendReceiptEmail(Long receiptId) {
        if (emailService == null) {
            logger.warn("Email service not configured. Cannot send receipt email.");
            return;
        }

        ReceiptDto receiptDto = getReceiptById(receiptId);

        if (receiptDto.getMemberId() == null) {
            logger.warn("Cannot send receipt email: No member associated with receipt {}", receiptId);
            return;
        }

        Member member = memberRepository.findById(receiptDto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member", receiptDto.getMemberId()));

        if (member.getEmail() == null || member.getEmail().isEmpty()) {
            logger.warn("Cannot send receipt email: No email address for member {}", member.getId());
            return;
        }

        byte[] pdfBytes = receiptPdfService.generateReceiptPdf(receiptDto);

        emailService.sendReceiptEmail(
                member.getEmail(),
                member.getFirstName() + " " + member.getLastName(),
                receiptDto.getReceiptNumber(),
                receiptDto.getAmount(),
                pdfBytes);

        logger.info("Receipt email sent for receipt {} to {}", receiptId, member.getEmail());
    }

    private ReceiptDto mapToDto(Receipt receipt) {
        ReceiptDto dto = new ReceiptDto();
        dto.setId(receipt.getId());
        dto.setReceiptNumber(receipt.getReceiptNumber());
        if (receipt.getMember() != null) {
            dto.setMemberId(receipt.getMember().getId());
            dto.setMemberName(receipt.getMember().getFirstName() + " " + receipt.getMember().getLastName());
        }
        dto.setContributionType(receipt.getContributionType());
        dto.setContributionId(receipt.getContributionId());
        dto.setAmount(receipt.getAmount());
        dto.setReceiptDate(receipt.getReceiptDate());
        dto.setTreasurerName(receipt.getTreasurerName());
        dto.setTreasurerSignature(receipt.getTreasurerSignature());
        dto.setNotes(receipt.getNotes());
        dto.setStatus(receipt.getStatus());
        return dto;
    }
}
