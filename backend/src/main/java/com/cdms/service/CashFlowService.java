package com.cdms.service;

import com.cdms.dto.CashFlowEntryDto;
import com.cdms.dto.CashFlowStatementDto;
import com.cdms.entity.CashFlowEntry;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.CashFlowEntryRepository;
import com.cdms.repository.FundRepository;
import org.springframework.stereotype.Service;

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
        return cashFlowEntryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<CashFlowEntryDto> getEntriesByDateRange(LocalDate start, LocalDate end) {
        return cashFlowEntryRepository.findByEntryDateBetween(start, end).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CashFlowEntryDto createEntry(CashFlowEntryDto dto) {
        CashFlowEntry entry = new CashFlowEntry();
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
        cashFlowEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CashFlowEntry", id));
        cashFlowEntryRepository.deleteById(id);
    }

    public CashFlowStatementDto getCashFlowStatement(LocalDate start, LocalDate end) {
        LocalDate previousPeriodEnd = start.minusDays(1);
        LocalDate previousPeriodStart = previousPeriodEnd.minusDays(end.toEpochDay() - start.toEpochDay());

        BigDecimal openingBalance = cashFlowEntryRepository.sumByEntryTypeAndEntryDateBetween("INCOME", previousPeriodStart, previousPeriodEnd)
                .subtract(cashFlowEntryRepository.sumByEntryTypeAndEntryDateBetween("EXPENSE", previousPeriodStart, previousPeriodEnd));

        BigDecimal totalIncome = cashFlowEntryRepository.sumByEntryTypeAndEntryDateBetween("INCOME", start, end);
        BigDecimal totalExpenses = cashFlowEntryRepository.sumByEntryTypeAndEntryDateBetween("EXPENSE", start, end);
        BigDecimal closingBalance = openingBalance.add(totalIncome).subtract(totalExpenses);

        Map<String, BigDecimal> incomeBreakdown = getCategoryBreakdown("INCOME", start, end);
        Map<String, BigDecimal> expenseBreakdown = getCategoryBreakdown("EXPENSE", start, end);

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

    private Map<String, BigDecimal> getCategoryBreakdown(String entryType, LocalDate start, LocalDate end) {
        List<CashFlowEntry> entries = cashFlowEntryRepository.findByEntryTypeAndEntryDateBetween(entryType, start, end);
        return entries.stream()
                .collect(Collectors.groupingBy(
                        CashFlowEntry::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, CashFlowEntry::getAmount, BigDecimal::add)
                ));
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
