package com.cdms.service;

import com.cdms.dto.CashFlowEntryDto;
import com.cdms.dto.CashFlowStatementDto;
import com.cdms.entity.CashFlowEntry;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.CashFlowEntryRepository;
import com.cdms.repository.FundRepository;
import org.springframework.stereotype.Service;
import com.cdms.security.TenantContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CashFlowService {

    private final CashFlowEntryRepository cashFlowEntryRepository;
    private final FundRepository fundRepository;

    public CashFlowService(CashFlowEntryRepository cashFlowEntryRepository, FundRepository fundRepository) {
        this.cashFlowEntryRepository = cashFlowEntryRepository;
        this.fundRepository = fundRepository;
    }

    public List<CashFlowEntryDto> getAllEntries() {
        return cashFlowEntryRepository.findByChurchId(TenantContext.getChurchId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<CashFlowEntryDto> getEntriesByDateRange(LocalDate start, LocalDate end) {
        return cashFlowEntryRepository.findByChurchId(TenantContext.getChurchId()).stream()
                .filter(e -> !e.getEntryDate().isBefore(start) && !e.getEntryDate().isAfter(end))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CashFlowEntryDto createEntry(CashFlowEntryDto dto) {
        CashFlowEntry entry = new CashFlowEntry();
        entry.setChurchId(TenantContext.getChurchId());
        entry.setEntryDate(dto.getEntryDate());
        entry.setEntryType(dto.getEntryType());
        entry.setCategory(dto.getCategory());
        entry.setDescription(dto.getDescription());
        entry.setAmount(dto.getAmount());
        entry.setReferenceNumber(dto.getReferenceNumber());
        entry.setSource(dto.getSource());
        entry.setSourceId(dto.getSourceId());

        CashFlowEntry savedEntry = cashFlowEntryRepository.save(entry);
        return mapToDto(savedEntry);
    }

    public void deleteEntry(Long id) {
        CashFlowEntry entry = cashFlowEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CashFlowEntry", id));
        if (!entry.getChurchId().equals(TenantContext.getChurchId())) {
            throw new ResourceNotFoundException("CashFlowEntry", id);
        }
        cashFlowEntryRepository.delete(entry);
    }

    public CashFlowStatementDto getCashFlowStatement(LocalDate start, LocalDate end) {
        Long churchId = TenantContext.getChurchId();
        List<CashFlowEntry> allChurchEntries = cashFlowEntryRepository.findByChurchId(churchId);

        LocalDate previousPeriodEnd = start.minusDays(1);
        BigDecimal totalPreviousIncome = allChurchEntries.stream()
                .filter(e -> "INCOME".equals(e.getEntryType()) && !e.getEntryDate().isAfter(previousPeriodEnd))
                .map(CashFlowEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPreviousExpense = allChurchEntries.stream()
                .filter(e -> "EXPENSE".equals(e.getEntryType()) && !e.getEntryDate().isAfter(previousPeriodEnd))
                .map(CashFlowEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal openingBalance = totalPreviousIncome.subtract(totalPreviousExpense);

        List<CashFlowEntry> periodEntries = allChurchEntries.stream()
                .filter(e -> !e.getEntryDate().isBefore(start) && !e.getEntryDate().isAfter(end))
                .collect(Collectors.toList());

        BigDecimal totalIncome = periodEntries.stream()
                .filter(e -> "INCOME".equals(e.getEntryType()))
                .map(CashFlowEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = periodEntries.stream()
                .filter(e -> "EXPENSE".equals(e.getEntryType()))
                .map(CashFlowEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal closingBalance = openingBalance.add(totalIncome).subtract(totalExpenses);

        Map<String, BigDecimal> incomeBreakdown = periodEntries.stream()
                .filter(e -> "INCOME".equals(e.getEntryType()))
                .collect(Collectors.groupingBy(
                        CashFlowEntry::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, CashFlowEntry::getAmount, BigDecimal::add)
                ));

        Map<String, BigDecimal> expenseBreakdown = periodEntries.stream()
                .filter(e -> "EXPENSE".equals(e.getEntryType()))
                .collect(Collectors.groupingBy(
                        CashFlowEntry::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, CashFlowEntry::getAmount, BigDecimal::add)
                ));

        CashFlowStatementDto statement = new CashFlowStatementDto();
        statement.setPeriod(start + " to " + end);
        statement.setStartDate(start);
        statement.setEndDate(end);
        statement.setOpeningBalance(openingBalance);
        statement.setTotalIncome(totalIncome);
        statement.setTotalExpenses(totalExpenses);
        statement.setClosingBalance(closingBalance);
        statement.setIncomeBreakdown(incomeBreakdown);
        statement.setExpenseBreakdown(expenseBreakdown);
        return statement;
    }

    public CashFlowStatementDto getDailyCashFlow(LocalDate date) {
        return getCashFlowStatement(date, date);
    }

    public CashFlowStatementDto getMonthlyCashFlow(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        return getCashFlowStatement(yearMonth.atDay(1), yearMonth.atEndOfMonth());
    }

    public CashFlowStatementDto getAnnualCashFlow(int year) {
        return getCashFlowStatement(LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31));
    }

    private CashFlowEntryDto mapToDto(CashFlowEntry entry) {
        CashFlowEntryDto dto = new CashFlowEntryDto();
        dto.setId(entry.getId());
        dto.setEntryDate(entry.getEntryDate());
        dto.setEntryType(entry.getEntryType());
        dto.setCategory(entry.getCategory());
        dto.setDescription(entry.getDescription());
        dto.setAmount(entry.getAmount());
        dto.setReferenceNumber(entry.getReferenceNumber());
        dto.setSource(entry.getSource());
        dto.setSourceId(entry.getSourceId());
        dto.setCreatedBy(entry.getCreatedBy());
        return dto;
    }
}
