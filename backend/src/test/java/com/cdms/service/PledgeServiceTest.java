package com.cdms.service;

import com.cdms.dto.PledgeDto;
import com.cdms.dto.PledgePaymentDto;
import com.cdms.entity.Member;
import com.cdms.entity.Pledge;
import com.cdms.entity.PledgePayment;
import com.cdms.entity.User;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.MemberRepository;
import com.cdms.repository.PledgePaymentRepository;
import com.cdms.repository.PledgeRepository;
import com.cdms.repository.UserRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PledgeServiceTest {

    @Mock
    private PledgeRepository pledgeRepository;

    @Mock
    private PledgePaymentRepository pledgePaymentRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private PledgeService pledgeService;

    private Pledge pledge;
    private PledgePayment pledgePayment;
    private Member member;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("admin@cdms.com");

        member = new Member();
        member.setId(1L);
        member.setFirstName("John");
        member.setLastName("Doe");

        pledge = new Pledge();
        pledge.setId(1L);
        pledge.setMember(member);
        pledge.setPledgeType("BUILDING");
        pledge.setDescription("Building pledge");
        pledge.setPledgeAmount(BigDecimal.valueOf(5000));
        pledge.setAmountPaid(BigDecimal.ZERO);
        pledge.setDueDate(LocalDate.now().plusMonths(6));
        pledge.setStatus("ACTIVE");
        pledge.setFrequency("MONTHLY");

        pledgePayment = new PledgePayment();
        pledgePayment.setId(1L);
        pledgePayment.setPledge(pledge);
        pledgePayment.setAmount(BigDecimal.valueOf(500));
        pledgePayment.setPaymentDate(LocalDate.now());
        pledgePayment.setPaymentMethod("CASH");
    }

    @Test
    void createPledge_Success() {
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(pledgeRepository.save(any(Pledge.class))).thenReturn(pledge);

        PledgeDto dto = new PledgeDto();
        dto.setMemberId(1L);
        dto.setPledgeType("BUILDING");
        dto.setDescription("Building pledge");
        dto.setPledgeAmount(BigDecimal.valueOf(5000));
        dto.setDueDate(LocalDate.now().plusMonths(6));
        dto.setFrequency("MONTHLY");

        PledgeDto result = pledgeService.createPledge(dto);

        assertThat(result).isNotNull();
        assertThat(result.getPledgeAmount()).isEqualByComparingTo(BigDecimal.valueOf(5000));
        assertThat(result.getAmountPaid()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
        verify(pledgeRepository, times(1)).save(any(Pledge.class));
    }

    @Test
    void recordPayment_Success() {
        when(pledgeRepository.findById(1L)).thenReturn(Optional.of(pledge));
        when(pledgePaymentRepository.save(any(PledgePayment.class))).thenReturn(pledgePayment);
        when(pledgeRepository.save(any(Pledge.class))).thenReturn(pledge);

        PledgePaymentDto dto = new PledgePaymentDto();
        dto.setPledgeId(1L);
        dto.setAmount(BigDecimal.valueOf(500));
        dto.setPaymentDate(LocalDate.now());
        dto.setPaymentMethod("CASH");

        PledgePaymentDto result = pledgeService.recordPayment(dto);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(500));
        assertThat(pledge.getAmountPaid()).isEqualByComparingTo(BigDecimal.valueOf(500));
        assertThat(pledge.getStatus()).isEqualTo("ACTIVE");
        verify(pledgePaymentRepository, times(1)).save(any(PledgePayment.class));
        verify(pledgeRepository, times(1)).save(any(Pledge.class));
    }

    @Test
    void recordPayment_CompletesPledge() {
        pledge.setPledgeAmount(BigDecimal.valueOf(500));
        when(pledgeRepository.findById(1L)).thenReturn(Optional.of(pledge));
        when(pledgePaymentRepository.save(any(PledgePayment.class))).thenReturn(pledgePayment);
        when(pledgeRepository.save(any(Pledge.class))).thenReturn(pledge);

        PledgePaymentDto dto = new PledgePaymentDto();
        dto.setPledgeId(1L);
        dto.setAmount(BigDecimal.valueOf(500));
        dto.setPaymentDate(LocalDate.now());
        dto.setPaymentMethod("CASH");

        PledgePaymentDto result = pledgeService.recordPayment(dto);

        assertThat(result).isNotNull();
        assertThat(pledge.getAmountPaid()).isEqualByComparingTo(BigDecimal.valueOf(500));
        assertThat(pledge.getStatus()).isEqualTo("COMPLETED");
    }

    @Test
    void getAllPledges_Success() {
        when(pledgeRepository.findAll()).thenReturn(Arrays.asList(pledge));

        List<PledgeDto> result = pledgeService.getAllPledges();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPledgeType()).isEqualTo("BUILDING");
    }
}