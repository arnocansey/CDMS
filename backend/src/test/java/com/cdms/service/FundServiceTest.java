package com.cdms.service;

import com.cdms.dto.FundDto;
import com.cdms.dto.FundTransactionDto;
import com.cdms.entity.Fund;
import com.cdms.entity.FundTransaction;
import com.cdms.entity.User;
import com.cdms.exception.BadRequestException;
import com.cdms.repository.FundRepository;
import com.cdms.repository.FundTransactionRepository;
import com.cdms.repository.UserRepository;
import com.cdms.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FundServiceTest {

    @Mock
    private FundRepository fundRepository;

    @Mock
    private FundTransactionRepository fundTransactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private FundService fundService;

    private Fund fund;
    private FundTransaction fundTransaction;
    private User user;

    @BeforeEach
    void setUp() {
        TenantContext.setChurchId(1L);

        user = new User();
        user.setId(1L);
        user.setEmail("admin@cdms.com");

        fund = new Fund();
        fund.setId(1L);
        fund.setChurchId(1L);
        fund.setName("Building Fund");
        fund.setFundType("BUILDING");
        fund.setOpeningBalance(BigDecimal.valueOf(10000));
        fund.setCurrentBalance(BigDecimal.valueOf(10000));
        fund.setTargetAmount(BigDecimal.valueOf(50000));
        fund.setActive(true);
        fund.setCreatedBy("admin@cdms.com");

        fundTransaction = new FundTransaction();
        fundTransaction.setId(1L);
        fundTransaction.setFund(fund);
        fundTransaction.setTransactionType("INCOME");
        fundTransaction.setAmount(BigDecimal.valueOf(500));
        fundTransaction.setDescription("Donation for building fund");
        fundTransaction.setTransactionDate(LocalDate.now());
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    void createFund_Success() {
        when(fundRepository.save(any(Fund.class))).thenReturn(fund);
        
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn("admin@cdms.com");
        SecurityContextHolder.getContext().setAuthentication(auth);

        FundDto dto = new FundDto();
        dto.setName("Building Fund");
        dto.setFundType("BUILDING");
        dto.setOpeningBalance(BigDecimal.valueOf(10000));
        dto.setTargetAmount(BigDecimal.valueOf(50000));
        dto.setActive(true);

        FundDto result = fundService.createFund(dto);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Building Fund");
        assertThat(result.getCurrentBalance()).isEqualByComparingTo(BigDecimal.valueOf(10000));
        verify(fundRepository, times(1)).save(any(Fund.class));
    }

    @Test
    void updateFund_Success() {
        when(fundRepository.findById(1L)).thenReturn(Optional.of(fund));
        when(fundRepository.save(any(Fund.class))).thenReturn(fund);

        FundDto dto = new FundDto();
        dto.setName("Updated Building Fund");
        dto.setFundType("BUILDING");
        dto.setOpeningBalance(BigDecimal.valueOf(10000));
        dto.setCurrentBalance(BigDecimal.valueOf(15000));
        dto.setTargetAmount(BigDecimal.valueOf(50000));
        dto.setActive(true);

        FundDto result = fundService.updateFund(1L, dto);

        assertThat(result).isNotNull();
        verify(fundRepository, times(1)).save(any(Fund.class));
    }

    @Test
    void deleteFund_Success() {
        when(fundRepository.findById(1L)).thenReturn(Optional.of(fund));
        doNothing().when(fundRepository).delete(fund);

        fundService.deleteFund(1L);

        verify(fundRepository, times(1)).delete(fund);
    }

    @Test
    void getAllFunds_Success() {
        when(fundRepository.findByChurchId(1L)).thenReturn(Arrays.asList(fund));

        List<FundDto> result = fundService.getAllFunds();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Building Fund");
    }

    @Test
    void getAllFunds_NoChurchContext_ThrowsBadRequest() {
        TenantContext.clear();

        assertThatThrownBy(() -> fundService.getAllFunds())
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("No church context set");
    }

    @Test
    void recordFundTransaction_Success() {
        when(fundRepository.findById(1L)).thenReturn(Optional.of(fund));
        when(fundRepository.save(any(Fund.class))).thenReturn(fund);
        when(fundTransactionRepository.save(any(FundTransaction.class))).thenReturn(fundTransaction);

        FundTransactionDto dto = new FundTransactionDto();
        dto.setFundId(1L);
        dto.setTransactionType("INCOME");
        dto.setAmount(BigDecimal.valueOf(500));
        dto.setDescription("Donation for building fund");
        dto.setTransactionDate(LocalDate.now());

        FundTransactionDto result = fundService.recordFundTransaction(dto);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(500));
        assertThat(fund.getCurrentBalance()).isEqualByComparingTo(BigDecimal.valueOf(10500));
        verify(fundRepository, times(1)).save(any(Fund.class));
        verify(fundTransactionRepository, times(1)).save(any(FundTransaction.class));
    }
}
