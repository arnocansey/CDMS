package com.cdms.service;

import com.cdms.entity.BankReconciliation;
import com.cdms.entity.CashFlowEntry;
import com.cdms.entity.ReconciliationEntry;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.BankReconciliationRepository;
import com.cdms.repository.CashFlowEntryRepository;
import com.cdms.repository.ReconciliationEntryRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BankReconciliationService {

    private final BankReconciliationRepository bankReconciliationRepository;
    private final ReconciliationEntryRepository reconciliationEntryRepository;
    private final CashFlowEntryRepository cashFlowEntryRepository;

    public BankReconciliationService(BankReconciliationRepository bankReconciliationRepository,
                                     ReconciliationEntryRepository reconciliationEntryRepository,
                                     CashFlowEntryRepository cashFlowEntryRepository) {
        this.bankReconciliationRepository = bankReconciliationRepository;
        this.reconciliationEntryRepository = reconciliationEntryRepository;
        this.cashFlowEntryRepository = cashFlowEntryRepository;
    }

    public BankReconciliation startReconciliation(Long churchId, LocalDate statementDate, BigDecimal bankBalance) {
        List<CashFlowEntry> entries = cashFlowEntryRepository.findByEntryDateBetween(
                statementDate.withDayOfMonth(1), statementDate);

        BigDecimal bookBalance = BigDecimal.ZERO;
        for (CashFlowEntry entry : entries) {
            if ("INCOME".equals(entry.getEntryType())) {
                bookBalance = bookBalance.add(entry.getAmount());
            } else if ("EXPENSE".equals(entry.getEntryType())) {
                bookBalance = bookBalance.subtract(entry.getAmount());
            }
        }

        BankReconciliation reconciliation = new BankReconciliation();
        reconciliation.setChurchId(churchId);
        reconciliation.setBankStatementDate(statementDate);
        reconciliation.setBankBalance(bankBalance);
        reconciliation.setBookBalance(bookBalance);
        reconciliation.setStatus("PENDING");

        BankReconciliation savedReconciliation = bankReconciliationRepository.save(reconciliation);

        for (CashFlowEntry entry : entries) {
            ReconciliationEntry reconEntry = new ReconciliationEntry();
            reconEntry.setChurchId(churchId);
            reconEntry.setReconciliation(savedReconciliation);
            reconEntry.setCashFlowEntry(entry);
            reconEntry.setMatched(false);
            reconEntry.setBankAmount(BigDecimal.ZERO);
            reconEntry.setBookAmount(entry.getAmount());
            reconEntry.setDescription(entry.getDescription());
            reconEntry.setTransactionDate(entry.getEntryDate());
            reconciliationEntryRepository.save(reconEntry);
        }

        return savedReconciliation;
    }

    public BankReconciliation getReconciliation(Long id) {
        return bankReconciliationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BankReconciliation", id));
    }

    public ReconciliationEntry matchEntry(Long entryId) {
        ReconciliationEntry entry = reconciliationEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("ReconciliationEntry", entryId));
        entry.setMatched(true);
        return reconciliationEntryRepository.save(entry);
    }

    public BankReconciliation completeReconciliation(Long id) {
        BankReconciliation reconciliation = bankReconciliationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BankReconciliation", id));

        if (!"PENDING".equals(reconciliation.getStatus())) {
            throw new BadRequestException("Reconciliation is not in PENDING status");
        }

        List<ReconciliationEntry> entries = reconciliationEntryRepository.findByReconciliationId(id);
        boolean allMatched = entries.stream().allMatch(ReconciliationEntry::getMatched);

        BigDecimal difference = reconciliation.getBankBalance().subtract(reconciliation.getBookBalance());
        reconciliation.setDifference(difference);

        if (allMatched && difference.compareTo(BigDecimal.ZERO) == 0) {
            reconciliation.setStatus("RECONCILED");
        } else {
            reconciliation.setStatus("DISCREPANCY");
        }

        reconciliation.setReconciledAt(LocalDateTime.now());
        return bankReconciliationRepository.save(reconciliation);
    }

    public List<BankReconciliation> getHistory(Long churchId) {
        return bankReconciliationRepository.findByChurchId(churchId);
    }
}
