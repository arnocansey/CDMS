package com.cdms.service;

import com.cdms.dto.PrayerRequestDto;
import com.cdms.entity.PrayerRequest;
import com.cdms.entity.Member;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.PrayerRequestRepository;
import com.cdms.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cdms.security.TenantContext;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrayerRequestService {

    private final PrayerRequestRepository prayerRequestRepository;
    private final MemberRepository memberRepository;

    public PrayerRequestService(PrayerRequestRepository prayerRequestRepository, MemberRepository memberRepository) {
        this.prayerRequestRepository = prayerRequestRepository;
        this.memberRepository = memberRepository;
    }

    public List<PrayerRequestDto> getAllPrayerRequests() {
        return prayerRequestRepository.findByAnonymousFalseOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PrayerRequestDto> getPendingPrayerRequests() {
        return prayerRequestRepository.findByStatus(PrayerRequest.PrayerRequestStatus.PENDING).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PrayerRequestDto getPrayerRequestById(Long id) {
        PrayerRequest prayerRequest = prayerRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prayer Request", id));
        return mapToDto(prayerRequest);
    }

    @Transactional
    public PrayerRequestDto createPrayerRequest(PrayerRequestDto prayerRequestDto) {
        PrayerRequest prayerRequest = new PrayerRequest();
        prayerRequest.setChurchId(TenantContext.getChurchId());
        prayerRequest.setTitle(prayerRequestDto.getTitle());
        prayerRequest.setDescription(prayerRequestDto.getDescription());
        prayerRequest.setAnonymous(prayerRequestDto.isAnonymous());

        if (prayerRequestDto.getMemberId() != null) {
            Member member = memberRepository.findById(prayerRequestDto.getMemberId())
                    .orElseThrow(() -> new ResourceNotFoundException("Member", prayerRequestDto.getMemberId()));
            prayerRequest.setMember(member);
        }

        PrayerRequest savedPrayerRequest = prayerRequestRepository.save(prayerRequest);
        return mapToDto(savedPrayerRequest);
    }

    @Transactional
    public PrayerRequestDto approvePrayerRequest(Long id, String prayedBy) {
        PrayerRequest prayerRequest = prayerRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prayer Request", id));

        prayerRequest.setStatus(PrayerRequest.PrayerRequestStatus.IN_PROGRESS);
        prayerRequest.setPrayedBy(prayedBy);
        prayerRequest.setPrayedAt(LocalDateTime.now());

        PrayerRequest updatedPrayerRequest = prayerRequestRepository.save(prayerRequest);
        return mapToDto(updatedPrayerRequest);
    }

    @Transactional
    public PrayerRequestDto markAsAnswered(Long id) {
        PrayerRequest prayerRequest = prayerRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prayer Request", id));

        prayerRequest.setStatus(PrayerRequest.PrayerRequestStatus.ANSWERED);

        PrayerRequest updatedPrayerRequest = prayerRequestRepository.save(prayerRequest);
        return mapToDto(updatedPrayerRequest);
    }

    public long getPendingPrayerRequestsCount() {
        return prayerRequestRepository.countByStatus(PrayerRequest.PrayerRequestStatus.PENDING);
    }

    private PrayerRequestDto mapToDto(PrayerRequest prayerRequest) {
        PrayerRequestDto dto = new PrayerRequestDto();
        dto.setId(prayerRequest.getId());
        dto.setTitle(prayerRequest.getTitle());
        dto.setDescription(prayerRequest.getDescription());
        dto.setStatus(prayerRequest.getStatus());
        dto.setAnonymous(prayerRequest.isAnonymous());
        dto.setPrayedBy(prayerRequest.getPrayedBy());
        if (prayerRequest.getMember() != null) {
            dto.setMemberId(prayerRequest.getMember().getId());
            dto.setMemberName(prayerRequest.getMember().getFirstName() + " " + prayerRequest.getMember().getLastName());
        }
        return dto;
    }
}
