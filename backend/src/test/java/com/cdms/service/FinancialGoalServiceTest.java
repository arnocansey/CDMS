package com.cdms.service;

import com.cdms.dto.FinancialGoalDto;
import com.cdms.dto.GoalContributionDto;
import com.cdms.entity.FinancialGoal;
import com.cdms.entity.GoalContribution;
import com.cdms.entity.Member;
import com.cdms.entity.User;
import com.cdms.exception.BadRequestException;
import com.cdms.repository.FinancialGoalRepository;
import com.cdms.repository.GoalContributionRepository;
import com.cdms.repository.MemberRepository;
import com.cdms.repository.UserRepository;
import com.cdms.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
class FinancialGoalServiceTest {

    @Mock
    private FinancialGoalRepository financialGoalRepository;

    @Mock
    private GoalContributionRepository goalContributionRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private FinancialGoalService financialGoalService;

    private FinancialGoal financialGoal;
    private GoalContribution goalContribution;
    private Member member;
    private User user;

    @BeforeEach
    void setUp() {
        TenantContext.setChurchId(1L);

        user = new User();
        user.setId(1L);
        user.setEmail("admin@cdms.com");

        member = new Member();
        member.setId(1L);
        member.setChurchId(1L);
        member.setFirstName("John");
        member.setLastName("Doe");

        financialGoal = new FinancialGoal();
        financialGoal.setId(1L);
        financialGoal.setChurchId(1L);
        financialGoal.setName("Building Fund");
        financialGoal.setDescription("New church building");
        financialGoal.setTargetAmount(BigDecimal.valueOf(100000));
        financialGoal.setAmountRaised(BigDecimal.ZERO);
        financialGoal.setStartDate(LocalDate.now());
        financialGoal.setEndDate(LocalDate.now().plusYears(2));
        financialGoal.setStatus("ACTIVE");
        financialGoal.setCategory("BUILDING");

        goalContribution = new GoalContribution();
        goalContribution.setId(1L);
        goalContribution.setGoal(financialGoal);
        goalContribution.setAmount(BigDecimal.valueOf(1000));
        goalContribution.setContributionDate(LocalDate.now());
        goalContribution.setPaymentMethod("CASH");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void createGoal_Success() {
        when(financialGoalRepository.save(any(FinancialGoal.class))).thenReturn(financialGoal);

        FinancialGoalDto dto = new FinancialGoalDto();
        dto.setName("Building Fund");
        dto.setDescription("New church building");
        dto.setTargetAmount(BigDecimal.valueOf(100000));
        dto.setStartDate(LocalDate.now());
        dto.setEndDate(LocalDate.now().plusYears(2));
        dto.setCategory("BUILDING");

        FinancialGoalDto result = financialGoalService.createGoal(dto);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Building Fund");
        assertThat(result.getTargetAmount()).isEqualByComparingTo(BigDecimal.valueOf(100000));
        assertThat(result.getAmountRaised()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
        verify(financialGoalRepository, times(1)).save(any(FinancialGoal.class));
    }

    @Test
    void recordContribution_Success() {
        when(financialGoalRepository.findById(1L)).thenReturn(Optional.of(financialGoal));
        when(goalContributionRepository.save(any(GoalContribution.class))).thenReturn(goalContribution);
        when(financialGoalRepository.save(any(FinancialGoal.class))).thenReturn(financialGoal);

        GoalContributionDto dto = new GoalContributionDto();
        dto.setGoalId(1L);
        dto.setAmount(BigDecimal.valueOf(1000));
        dto.setContributionDate(LocalDate.now());
        dto.setPaymentMethod("CASH");

        GoalContributionDto result = financialGoalService.recordContribution(dto);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(1000));
        assertThat(financialGoal.getAmountRaised()).isEqualByComparingTo(BigDecimal.valueOf(1000));
        assertThat(financialGoal.getStatus()).isEqualTo("ACTIVE");
        verify(goalContributionRepository, times(1)).save(any(GoalContribution.class));
        verify(financialGoalRepository, times(1)).save(any(FinancialGoal.class));
    }

    @Test
    void recordContribution_CompletesGoal() {
        financialGoal.setTargetAmount(BigDecimal.valueOf(1000));
        when(financialGoalRepository.findById(1L)).thenReturn(Optional.of(financialGoal));
        when(goalContributionRepository.save(any(GoalContribution.class))).thenReturn(goalContribution);
        when(financialGoalRepository.save(any(FinancialGoal.class))).thenReturn(financialGoal);

        GoalContributionDto dto = new GoalContributionDto();
        dto.setGoalId(1L);
        dto.setAmount(BigDecimal.valueOf(1000));
        dto.setContributionDate(LocalDate.now());
        dto.setPaymentMethod("CASH");

        GoalContributionDto result = financialGoalService.recordContribution(dto);

        assertThat(result).isNotNull();
        assertThat(financialGoal.getAmountRaised()).isEqualByComparingTo(BigDecimal.valueOf(1000));
        assertThat(financialGoal.getStatus()).isEqualTo("COMPLETED");
    }

    @Test
    void getAllGoals_Success() {
        when(financialGoalRepository.findByChurchId(1L)).thenReturn(Arrays.asList(financialGoal));

        List<FinancialGoalDto> result = financialGoalService.getAllGoals();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Building Fund");
    }

    @Test
    void getAllGoals_NoChurchContext_ThrowsBadRequest() {
        TenantContext.clear();

        assertThatThrownBy(() -> financialGoalService.getAllGoals())
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("No church context set");
    }
}
