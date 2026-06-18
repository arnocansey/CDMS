package com.cdms.service;

import com.cdms.dto.FundDto;
import com.cdms.dto.FundTransactionDto;
import com.cdms.entity.Fund;
import org.springframework.transaction.annotation.Transactional;
import com.cdms.entity.FundTransaction;
import com.cdms.security.TenantContext;
import com.cdms.entity.User;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.FundRepository;
import com.cdms.repository.FundTransactionRepository;
import com.cdms.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FundService {

    private final FundRepository fundRepository;
    private final FundTransactionRepository fundTransactionRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public FundService(FundRepository fundRepository, FundTransactionRepository fundTransactionRepository,
                       UserRepository userRepository, AuditLogService auditLogService) {
        this.fundRepository = fundRepository;
        this.fundTransactionRepository = fundTransactionRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<FundDto> getAllFunds() {
        return fundRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public FundDto getFundById(Long id) {
        Fund fund = fundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fund", id));
        return mapToDto(fund);
    }

    public List<FundDto> getActiveFunds() {
        return fundRepository.findByActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FundDto createFund(FundDto dto) {
        Fund fund = new Fund();
        fund.setChurchId(TenantContext.getChurchId());
        fund.setName(dto.getName());
        fund.setDescription(dto.getDescription());
        fund.setFundType(dto.getFundType());
        fund.setOpeningBalance(dto.getOpeningBalance() != null ? dto.getOpeningBalance() : BigDecimal.ZERO);
        fund.setCurrentBalance(dto.getOpeningBalance() != null ? dto.getOpeningBalance() : BigDecimal.ZERO);
        fund.setTargetAmount(dto.getTargetAmount());
        fund.setActive(dto.getActive() != null ? dto.getActive() : true);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() != null) {
            String email;
            if (auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                email = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
            } else if (auth.getPrincipal() instanceof String) {
                email = (String) auth.getPrincipal();
            } else {
                email = null;
            }
            if (email != null) {
                fund.setCreatedBy(email);
            }
        }

        Fund savedFund = fundRepository.save(fund);
        auditLogService.log(getCurrentUserId(), "CREATE", "FUND", savedFund.getId(),
                null, String.format("{\"name\":\"%s\",\"balance\":%s}", savedFund.getName(), savedFund.getCurrentBalance()));
        return mapToDto(savedFund);
    }

    @Transactional
    public FundDto updateFund(Long id, FundDto dto) {
        Fund fund = fundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fund", id));

        String oldValue = String.format("{\"name\":\"%s\",\"balance\":%s}", fund.getName(), fund.getCurrentBalance());

        fund.setName(dto.getName());
        fund.setDescription(dto.getDescription());
        fund.setFundType(dto.getFundType());
        fund.setOpeningBalance(dto.getOpeningBalance());
        fund.setCurrentBalance(dto.getCurrentBalance());
        fund.setTargetAmount(dto.getTargetAmount());
        fund.setActive(dto.getActive());

        Fund updatedFund = fundRepository.save(fund);
        String newValue = String.format("{\"name\":\"%s\",\"balance\":%s}", updatedFund.getName(), updatedFund.getCurrentBalance());
        auditLogService.log(getCurrentUserId(), "UPDATE", "FUND", updatedFund.getId(), oldValue, newValue);
        return mapToDto(updatedFund);
    }

    @Transactional
    public void deleteFund(Long id) {
        Fund fund = fundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fund", id));
        auditLogService.log(getCurrentUserId(), "DELETE", "FUND", id,
                String.format("{\"name\":\"%s\"}", fund.getName()), null);
        fundRepository.deleteById(id);
    }

    public Map<String, Object> getFundSummary() {
        List<Fund> funds = fundRepository.findByActiveTrue();
        BigDecimal totalBalance = funds.stream()
                .map(Fund::getCurrentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalFunds", funds.size());
        summary.put("totalBalance", totalBalance);
        summary.put("fundCount", (long) funds.size());
        return summary;
    }

    @Transactional
    public FundTransactionDto recordFundTransaction(FundTransactionDto dto) {
        Fund fund = fundRepository.findById(dto.getFundId())
                .orElseThrow(() -> new ResourceNotFoundException("Fund", dto.getFundId()));

        FundTransaction transaction = new FundTransaction();
        transaction.setFund(fund);
        transaction.setTransactionType(dto.getTransactionType());
        transaction.setAmount(dto.getAmount());
        transaction.setDescription(dto.getDescription());
        transaction.setReferenceNumber(dto.getReferenceNumber());
        transaction.setSourceType(dto.getSourceType());
        transaction.setSourceId(dto.getSourceId());
        transaction.setTransactionDate(dto.getTransactionDate() != null ? dto.getTransactionDate() : LocalDate.now());

        if ("INCOME".equals(dto.getTransactionType())) {
            fund.setCurrentBalance(fund.getCurrentBalance().add(dto.getAmount()));
        } else if ("EXPENSE".equals(dto.getTransactionType())) {
            fund.setCurrentBalance(fund.getCurrentBalance().subtract(dto.getAmount()));
        }
        fundRepository.save(fund);

        FundTransaction savedTransaction = fundTransactionRepository.save(transaction);
        auditLogService.log(getCurrentUserId(), "CREATE", "FUND_TRANSACTION", savedTransaction.getId(),
                null, String.format("{\"fundId\":%d,\"type\":\"%s\",\"amount\":%s}", fund.getId(), savedTransaction.getTransactionType(), savedTransaction.getAmount()));
        return mapTransactionToDto(savedTransaction);
    }

    @Transactional(readOnly = true)
    public List<FundTransactionDto> getFundTransactions(Long fundId) {
        return fundTransactionRepository.findByFundId(fundId).stream()
                .map(this::mapTransactionToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FundTransactionDto> getFundTransactionsByDateRange(Long fundId, LocalDate start, LocalDate end) {
        return fundTransactionRepository.findByFundIdAndTransactionDateBetween(fundId, start, end).stream()
                .map(this::mapTransactionToDto)
                .collect(Collectors.toList());
    }

    private FundDto mapToDto(Fund fund) {
        FundDto dto = new FundDto();
        dto.setId(fund.getId());
        dto.setName(fund.getName());
        dto.setDescription(fund.getDescription());
        dto.setFundType(fund.getFundType());
        dto.setOpeningBalance(fund.getOpeningBalance());
        dto.setCurrentBalance(fund.getCurrentBalance());
        dto.setTargetAmount(fund.getTargetAmount());
        dto.setActive(fund.isActive());
        dto.setCreatedBy(fund.getCreatedBy());
        dto.setCreatedAt(fund.getCreatedAt());
        return dto;
    }

    private FundTransactionDto mapTransactionToDto(FundTransaction transaction) {
        FundTransactionDto dto = new FundTransactionDto();
        dto.setId(transaction.getId());
        dto.setFundId(transaction.getFund().getId());
        dto.setFundName(transaction.getFund().getName());
        dto.setTransactionType(transaction.getTransactionType());
        dto.setAmount(transaction.getAmount());
        dto.setDescription(transaction.getDescription());
        dto.setReferenceNumber(transaction.getReferenceNumber());
        dto.setSourceType(transaction.getSourceType());
        dto.setSourceId(transaction.getSourceId());
        dto.setTransactionDate(transaction.getTransactionDate());
        dto.setCreatedBy(transaction.getCreatedBy());
        return dto;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() != null) {
            String email;
            if (auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                email = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
            } else if (auth.getPrincipal() instanceof String) {
                email = (String) auth.getPrincipal();
            } else {
                return null;
            }
            return userRepository.findByEmail(email).map(User::getId).orElse(null);
        }
        return null;
    }
}
