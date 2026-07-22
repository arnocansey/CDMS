package com.cdms.service;

import com.cdms.dto.*;
import com.cdms.entity.*;
import com.cdms.repository.*;
import com.cdms.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinancialServiceTest {

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private TitheRepository titheRepository;

    @Mock
    private OfferingRepository offeringRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private CashFlowEntryRepository cashFlowEntryRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private FinancialService financialService;

    private Donation donation;
    private Tithe tithe;
    private Offering offering;
    private Expense expense;
    private Member member;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        TenantContext.setChurchId(1L);
        pageable = PageRequest.of(0, 20);

        member = new Member();
        member.setId(1L);
        member.setFirstName("John");
        member.setLastName("Doe");

        donation = new Donation();
        donation.setId(1L);
        donation.setAmount(BigDecimal.valueOf(100));
        donation.setCategory("General");
        donation.setDonationDate(LocalDate.now());
        donation.setMember(member);

        tithe = new Tithe();
        tithe.setId(1L);
        tithe.setAmount(BigDecimal.valueOf(500));
        tithe.setTitheDate(LocalDate.now());
        tithe.setMember(member);

        offering = new Offering();
        offering.setId(1L);
        offering.setAmount(BigDecimal.valueOf(1000));
        offering.setServiceDate(LocalDate.now());
        offering.setServiceType("Sunday Service");

        expense = new Expense();
        expense.setId(1L);
        expense.setAmount(BigDecimal.valueOf(150));
        expense.setCategory("Utilities");
        expense.setExpenseDate(LocalDate.now());
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void getDonations_Success() {
        LocalDate start = LocalDate.now().minusDays(30);
        LocalDate end = LocalDate.now();
        when(donationRepository.findByChurchIdAndDonationDateBetween(eq(1L), eq(start), eq(end), eq(pageable)))
                .thenReturn(new PageImpl<>(Arrays.asList(donation)));

        Page<DonationDto> result = financialService.getDonations(start, end, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getAmount()).isEqualByComparingTo(BigDecimal.valueOf(100));
    }

    @Test
    void createDonation_Success() {
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(donationRepository.save(any(Donation.class))).thenReturn(donation);
        when(cashFlowEntryRepository.save(any(CashFlowEntry.class))).thenReturn(new CashFlowEntry());

        DonationDto dto = new DonationDto();
        dto.setMemberId(1L);
        dto.setAmount(BigDecimal.valueOf(100));
        dto.setCategory("General");
        dto.setDonationDate(LocalDate.now());

        DonationDto result = financialService.createDonation(dto);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(100));
        verify(donationRepository, times(1)).save(any(Donation.class));
        verify(cashFlowEntryRepository, times(1)).save(any(CashFlowEntry.class));
    }

    @Test
    void createTithe_Success() {
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(titheRepository.save(any(Tithe.class))).thenReturn(tithe);
        when(cashFlowEntryRepository.save(any(CashFlowEntry.class))).thenReturn(new CashFlowEntry());

        TitheDto dto = new TitheDto();
        dto.setMemberId(1L);
        dto.setAmount(BigDecimal.valueOf(500));
        dto.setTitheDate(LocalDate.now());

        TitheDto result = financialService.createTithe(dto);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(500));
        verify(cashFlowEntryRepository, times(1)).save(any(CashFlowEntry.class));
    }

    @Test
    void getOfferings_Success() {
        LocalDate start = LocalDate.now().minusDays(30);
        LocalDate end = LocalDate.now();
        when(offeringRepository.findByChurchIdAndServiceDateBetween(eq(1L), eq(start), eq(end), eq(pageable)))
                .thenReturn(new PageImpl<>(Arrays.asList(offering)));

        Page<OfferingDto> result = financialService.getOfferings(start, end, pageable);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void createOffering_Success() {
        when(offeringRepository.save(any(Offering.class))).thenReturn(offering);
        when(cashFlowEntryRepository.save(any(CashFlowEntry.class))).thenReturn(new CashFlowEntry());

        OfferingDto dto = new OfferingDto();
        dto.setServiceDate(LocalDate.now());
        dto.setServiceType("Sunday Service");
        dto.setAmount(BigDecimal.valueOf(1000));

        OfferingDto result = financialService.createOffering(dto);

        assertThat(result).isNotNull();
        verify(offeringRepository, times(1)).save(any(Offering.class));
        verify(cashFlowEntryRepository, times(1)).save(any(CashFlowEntry.class));
    }

    @Test
    void getExpenses_Success() {
        LocalDate start = LocalDate.now().minusDays(30);
        LocalDate end = LocalDate.now();
        when(expenseRepository.findByChurchIdAndExpenseDateBetween(eq(1L), eq(start), eq(end), eq(pageable)))
                .thenReturn(new PageImpl<>(Arrays.asList(expense)));

        Page<ExpenseDto> result = financialService.getExpenses(start, end, pageable);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void createExpense_Success() {
        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);
        when(cashFlowEntryRepository.save(any(CashFlowEntry.class))).thenReturn(new CashFlowEntry());
        when(budgetRepository.findByCategory(any())).thenReturn(Arrays.asList());

        ExpenseDto dto = new ExpenseDto();
        dto.setCategory("Utilities");
        dto.setAmount(BigDecimal.valueOf(150));
        dto.setExpenseDate(LocalDate.now());

        ExpenseDto result = financialService.createExpense(dto);

        assertThat(result).isNotNull();
        verify(expenseRepository, times(1)).save(any(Expense.class));
        verify(cashFlowEntryRepository, times(1)).save(any(CashFlowEntry.class));
    }

    @Test
    void getTotalDonations_ReturnsSum() {
        when(donationRepository.sumByDateRange(any(), any())).thenReturn(BigDecimal.valueOf(500));

        BigDecimal result = financialService.getTotalDonations(LocalDate.now().minusDays(30), LocalDate.now());

        assertThat(result).isEqualByComparingTo(BigDecimal.valueOf(500));
    }

    @Test
    void getTotalExpenses_ReturnsSum() {
        when(expenseRepository.sumByDateRange(any(), any())).thenReturn(BigDecimal.valueOf(200));

        BigDecimal result = financialService.getTotalExpenses(LocalDate.now().minusDays(30), LocalDate.now());

        assertThat(result).isEqualByComparingTo(BigDecimal.valueOf(200));
    }

    @Test
    void getNetBalance_CalculatesCorrectly() {
        when(donationRepository.sumByDateRange(any(), any())).thenReturn(BigDecimal.valueOf(500));
        when(titheRepository.sumByDateRange(any(), any())).thenReturn(BigDecimal.valueOf(300));
        when(offeringRepository.sumByDateRange(any(), any())).thenReturn(BigDecimal.valueOf(200));
        when(expenseRepository.sumByDateRange(any(), any())).thenReturn(BigDecimal.valueOf(400));

        BigDecimal result = financialService.getNetBalance(LocalDate.now().minusDays(30), LocalDate.now());

        assertThat(result).isEqualByComparingTo(BigDecimal.valueOf(600));
    }
}
