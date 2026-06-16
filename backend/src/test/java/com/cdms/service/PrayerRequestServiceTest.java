package com.cdms.service;

import com.cdms.dto.PrayerRequestDto;
import com.cdms.entity.Member;
import com.cdms.entity.PrayerRequest;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.MemberRepository;
import com.cdms.repository.PrayerRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrayerRequestServiceTest {

    @Mock
    private PrayerRequestRepository prayerRequestRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private PrayerRequestService prayerRequestService;

    private PrayerRequest prayerRequest;
    private Member member;

    @BeforeEach
    void setUp() {
        member = new Member();
        member.setId(1L);
        member.setFirstName("John");
        member.setLastName("Doe");

        prayerRequest = new PrayerRequest("Healing Prayer", "Please pray for my mother's healing.");
        prayerRequest.setId(1L);
        prayerRequest.setMember(member);
        prayerRequest.setStatus(PrayerRequest.PrayerRequestStatus.PENDING);
        prayerRequest.setAnonymous(false);
    }

    @Test
    void getAllPrayerRequests_Success() {
        when(prayerRequestRepository.findByAnonymousFalseOrderByCreatedAtDesc())
                .thenReturn(Arrays.asList(prayerRequest));

        List<PrayerRequestDto> result = prayerRequestService.getAllPrayerRequests();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Healing Prayer");
    }

    @Test
    void getPendingPrayerRequests_Success() {
        when(prayerRequestRepository.findByStatus(PrayerRequest.PrayerRequestStatus.PENDING))
                .thenReturn(Arrays.asList(prayerRequest));

        List<PrayerRequestDto> result = prayerRequestService.getPendingPrayerRequests();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(PrayerRequest.PrayerRequestStatus.PENDING);
    }

    @Test
    void getPrayerRequestById_Success() {
        when(prayerRequestRepository.findById(1L)).thenReturn(Optional.of(prayerRequest));

        PrayerRequestDto result = prayerRequestService.getPrayerRequestById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Healing Prayer");
    }

    @Test
    void getPrayerRequestById_NotFound_ThrowsException() {
        when(prayerRequestRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> prayerRequestService.getPrayerRequestById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Prayer Request not found with id: 999");
    }

    @Test
    void createPrayerRequest_Success() {
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(prayerRequestRepository.save(any(PrayerRequest.class))).thenReturn(prayerRequest);

        PrayerRequestDto dto = new PrayerRequestDto();
        dto.setMemberId(1L);
        dto.setTitle("Healing Prayer");
        dto.setDescription("Please pray for my mother's healing.");
        dto.setAnonymous(false);

        PrayerRequestDto result = prayerRequestService.createPrayerRequest(dto);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Healing Prayer");
        verify(prayerRequestRepository, times(1)).save(any(PrayerRequest.class));
    }

    @Test
    void createPrayerRequest_Anonymous_Success() {
        when(prayerRequestRepository.save(any(PrayerRequest.class))).thenReturn(prayerRequest);

        PrayerRequestDto dto = new PrayerRequestDto();
        dto.setTitle("Healing Prayer");
        dto.setDescription("Please pray for my mother's healing.");
        dto.setAnonymous(true);

        PrayerRequestDto result = prayerRequestService.createPrayerRequest(dto);

        assertThat(result).isNotNull();
        verify(prayerRequestRepository, times(1)).save(any(PrayerRequest.class));
    }

    @Test
    void approvePrayerRequest_Success() {
        when(prayerRequestRepository.findById(1L)).thenReturn(Optional.of(prayerRequest));
        when(prayerRequestRepository.save(any(PrayerRequest.class))).thenReturn(prayerRequest);

        PrayerRequestDto result = prayerRequestService.approvePrayerRequest(1L, "Pastor Smith");

        assertThat(result).isNotNull();
        verify(prayerRequestRepository, times(1)).save(any(PrayerRequest.class));
    }

    @Test
    void markAsAnswered_Success() {
        when(prayerRequestRepository.findById(1L)).thenReturn(Optional.of(prayerRequest));
        when(prayerRequestRepository.save(any(PrayerRequest.class))).thenReturn(prayerRequest);

        PrayerRequestDto result = prayerRequestService.markAsAnswered(1L);

        assertThat(result).isNotNull();
        verify(prayerRequestRepository, times(1)).save(any(PrayerRequest.class));
    }

    @Test
    void getPendingPrayerRequestsCount_ReturnsCount() {
        when(prayerRequestRepository.countByStatus(PrayerRequest.PrayerRequestStatus.PENDING)).thenReturn(5L);

        long result = prayerRequestService.getPendingPrayerRequestsCount();

        assertThat(result).isEqualTo(5L);
    }
}
