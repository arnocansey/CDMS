package com.cdms.service;

import com.cdms.dto.MemberDto;
import com.cdms.entity.Member;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.MemberRepository;
import com.cdms.repository.DepartmentRepository;
import com.cdms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private MemberService memberService;

    private Member member;
    private MemberDto memberDto;

    @BeforeEach
    void setUp() {
        member = new Member();
        member.setId(1L);
        member.setFirstName("John");
        member.setLastName("Doe");
        member.setEmail("john.doe@example.com");
        member.setPhone("1234567890");
        member.setGender("Male");
        member.setActive(true);
        member.setMembershipDate(LocalDate.now());

        memberDto = new MemberDto();
        memberDto.setFirstName("John");
        memberDto.setLastName("Doe");
        memberDto.setEmail("john.doe@example.com");
        memberDto.setPhone("1234567890");
        memberDto.setGender("Male");
        memberDto.setActive(true);
    }

    @Test
    void createMember_Success() {
        when(memberRepository.existsByEmail(anyString())).thenReturn(false);
        when(memberRepository.save(any(Member.class))).thenReturn(member);

        MemberDto result = memberService.createMember(memberDto);

        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getLastName()).isEqualTo("Doe");
        assertThat(result.getEmail()).isEqualTo("john.doe@example.com");

        verify(memberRepository, times(1)).save(any(Member.class));
    }

    @Test
    void createMember_DuplicateEmail_ThrowsException() {
        when(memberRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> memberService.createMember(memberDto))
                .isInstanceOf(com.cdms.exception.BadRequestException.class)
                .hasMessageContaining("Email already exists");

        verify(memberRepository, never()).save(any(Member.class));
    }

    @Test
    void getMemberById_Success() {
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        MemberDto result = memberService.getMemberById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getLastName()).isEqualTo("Doe");
    }

    @Test
    void getMemberById_NotFound_ThrowsException() {
        when(memberRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> memberService.getMemberById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Member not found");
    }

    @Test
    void updateMember_Success() {
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(memberRepository.save(any(Member.class))).thenReturn(member);

        MemberDto result = memberService.updateMember(1L, memberDto);

        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("John");

        verify(memberRepository, times(1)).save(any(Member.class));
    }

    @Test
    void deleteMember_Success() {
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        memberService.deleteMember(1L);

        verify(memberRepository, times(1)).delete(member);
    }

    @Test
    void getActiveMemberCount_Success() {
        when(memberRepository.countActiveMembers()).thenReturn(10L);

        long count = memberService.getActiveMemberCount();

        assertThat(count).isEqualTo(10L);
    }
}
