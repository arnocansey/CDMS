package com.cdms.service;

import com.cdms.dto.MemberDto;
import com.cdms.entity.Member;
import com.cdms.entity.Department;
import com.cdms.entity.User;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.entity.Branch;
import com.cdms.entity.Role;
import com.cdms.repository.BranchRepository;
import com.cdms.repository.DistrictRepository;
import com.cdms.repository.MemberRepository;
import com.cdms.repository.DepartmentRepository;
import com.cdms.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cdms.security.TenantContext;

import java.time.LocalDate;
import java.util.List;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    private final BranchRepository branchRepository;
    private final DistrictRepository districtRepository;

    public MemberService(MemberRepository memberRepository, DepartmentRepository departmentRepository,
                        UserRepository userRepository, AuditLogService auditLogService,
                        BranchRepository branchRepository, DistrictRepository districtRepository) {
        this.memberRepository = memberRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.branchRepository = branchRepository;
        this.districtRepository = districtRepository;
    }

    private User getCurrentUserEntity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() != null) {
            String email;
            if (auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                email = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
            } else if (auth.getPrincipal() instanceof String) {
                email = (String) auth.getPrincipal();
            } else {
                return null;
            }
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }

    private Page<Member> getScopedMembers(String search, Pageable pageable) {
        Long churchId = TenantContext.getChurchId();
        User currentUser = getCurrentUserEntity();

        if (currentUser == null) {
            return Page.empty();
        }

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == Role.RoleName.ROLE_ADMIN);
        boolean isPastor = currentUser.getRoles().stream().anyMatch(r -> r.getName() == Role.RoleName.ROLE_PASTOR);

        if (isAdmin) {
            if (search != null && !search.isEmpty()) {
                return memberRepository.searchMembersByChurchId(churchId, search, pageable);
            } else {
                return memberRepository.findByChurchId(churchId, pageable);
            }
        } else if (isPastor && currentUser.getDistrictId() != null) {
            List<Long> branchIds = branchRepository.findByDistrictId(currentUser.getDistrictId()).stream()
                    .map(Branch::getId)
                    .toList();
            if (branchIds.isEmpty()) {
                return Page.empty();
            }
            if (search != null && !search.isEmpty()) {
                return memberRepository.searchByBranchIds(branchIds, search, pageable);
            } else {
                return memberRepository.findByBranchIdIn(branchIds, pageable);
            }
        } else if (currentUser.getBranchId() != null) {
            if (search != null && !search.isEmpty()) {
                return memberRepository.searchByBranchId(currentUser.getBranchId(), search, pageable);
            } else {
                return memberRepository.findByBranchId(currentUser.getBranchId(), pageable);
            }
        }

        return Page.empty();
    }

    @Transactional(readOnly = true)
    public Page<MemberDto> getAllMembers(Pageable pageable) {
        return getScopedMembers(null, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<MemberDto> searchMembers(String search, Pageable pageable) {
        return getScopedMembers(search, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public MemberDto getMemberById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member", id));
        return mapToDto(member);
    }

    @Transactional
    public MemberDto createMember(MemberDto memberDto) {
        Long churchId = TenantContext.getChurchId();
        if (churchId != null) {
            if (memberRepository.existsByEmailAndChurchId(memberDto.getEmail(), churchId)) {
                throw new BadRequestException("Email already exists");
            }
        } else {
            if (memberRepository.existsByEmail(memberDto.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
        }

        Member member = new Member();
        member.setChurchId(TenantContext.getChurchId());
        member.setFirstName(memberDto.getFirstName());
        member.setLastName(memberDto.getLastName());
        member.setEmail(memberDto.getEmail());
        member.setPhone(memberDto.getPhone());
        member.setDateOfBirth(memberDto.getDateOfBirth());
        member.setGender(memberDto.getGender());
        member.setAddress(memberDto.getAddress());
        member.setCity(memberDto.getCity());
        member.setState(memberDto.getState());
        member.setZipCode(memberDto.getZipCode());
        member.setMembershipDate(memberDto.getMembershipDate() != null ? memberDto.getMembershipDate() : LocalDate.now());
        member.setBaptismDate(memberDto.getBaptismDate());
        member.setPhotoUrl(memberDto.getPhotoUrl());
        member.setActive(memberDto.isActive());
        member.setBranchId(memberDto.getBranchId());
        member.setDistrictId(memberDto.getDistrictId());

        if (memberDto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(memberDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", memberDto.getDepartmentId()));
            member.setDepartment(department);
        }

        Member savedMember = memberRepository.save(member);
        auditLogService.log(getCurrentUserId(), "CREATE", "MEMBER", savedMember.getId(),
                null, String.format("{\"name\":\"%s %s\",\"email\":\"%s\"}", savedMember.getFirstName(), savedMember.getLastName(), savedMember.getEmail()));
        return mapToDto(savedMember);
    }

    @Transactional
    public MemberDto updateMember(Long id, MemberDto memberDto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member", id));

        String oldValue = String.format("{\"name\":\"%s %s\"}", member.getFirstName(), member.getLastName());

        member.setFirstName(memberDto.getFirstName());
        member.setLastName(memberDto.getLastName());
        member.setPhone(memberDto.getPhone());
        member.setDateOfBirth(memberDto.getDateOfBirth());
        member.setGender(memberDto.getGender());
        member.setAddress(memberDto.getAddress());
        member.setCity(memberDto.getCity());
        member.setState(memberDto.getState());
        member.setZipCode(memberDto.getZipCode());
        member.setMembershipDate(memberDto.getMembershipDate());
        member.setBaptismDate(memberDto.getBaptismDate());
        member.setPhotoUrl(memberDto.getPhotoUrl());
        member.setActive(memberDto.isActive());
        member.setBranchId(memberDto.getBranchId());
        member.setDistrictId(memberDto.getDistrictId());

        if (memberDto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(memberDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", memberDto.getDepartmentId()));
            member.setDepartment(department);
        }

        Member updatedMember = memberRepository.save(member);
        String newValue = String.format("{\"name\":\"%s %s\"}", updatedMember.getFirstName(), updatedMember.getLastName());
        auditLogService.log(getCurrentUserId(), "UPDATE", "MEMBER", updatedMember.getId(), oldValue, newValue);
        return mapToDto(updatedMember);
    }

    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member", id));
        auditLogService.log(getCurrentUserId(), "DELETE", "MEMBER", id,
                String.format("{\"name\":\"%s %s\"}", member.getFirstName(), member.getLastName()), null);
        memberRepository.delete(member);
    }

    public long getActiveMemberCount() {
        return memberRepository.countActiveMembers();
    }

    private MemberDto mapToDto(Member member) {
        MemberDto dto = new MemberDto();
        dto.setId(member.getId());
        dto.setFirstName(member.getFirstName());
        dto.setLastName(member.getLastName());
        dto.setEmail(member.getEmail());
        dto.setPhone(member.getPhone());
        dto.setDateOfBirth(member.getDateOfBirth());
        dto.setGender(member.getGender());
        dto.setAddress(member.getAddress());
        dto.setCity(member.getCity());
        dto.setState(member.getState());
        dto.setZipCode(member.getZipCode());
        dto.setMembershipDate(member.getMembershipDate());
        dto.setBaptismDate(member.getBaptismDate());
        dto.setPhotoUrl(member.getPhotoUrl());
        dto.setActive(member.isActive());
        if (member.getDepartment() != null) {
            dto.setDepartmentId(member.getDepartment().getId());
            dto.setDepartmentName(member.getDepartment().getName());
        }
        dto.setBranchId(member.getBranchId());
        dto.setDistrictId(member.getDistrictId());
        if (member.getBranchId() != null) {
            branchRepository.findById(member.getBranchId()).ifPresent(b -> {
                dto.setBranchName(b.getName());
            });
        }
        if (member.getDistrictId() != null) {
            districtRepository.findById(member.getDistrictId()).ifPresent(d -> {
                dto.setDistrictName(d.getName());
            });
        }
        return dto;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() != null) {
            String email;
            if (auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                email = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
            } else if (auth.getPrincipal() instanceof String) {
                email = (String) auth.getPrincipal();
            } else {
                return null;
            }
            return userRepository.findByEmail(email).map(User::getId).orElse(null);
        }
        return null;
    }
}
