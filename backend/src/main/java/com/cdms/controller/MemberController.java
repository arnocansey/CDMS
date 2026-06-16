package com.cdms.controller;

import com.cdms.dto.MemberDto;
import com.cdms.repository.MemberRepository;
import com.cdms.security.TenantContext;
import com.cdms.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;
    private final MemberRepository memberRepository;

    public MemberController(MemberService memberService, MemberRepository memberRepository) {
        this.memberService = memberService;
        this.memberRepository = memberRepository;
    }

    @GetMapping
    public ResponseEntity<Page<MemberDto>> getAllMembers(Pageable pageable) {
        Page<MemberDto> members = memberService.getAllMembers(pageable);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getMemberStats() {
        Long churchId = TenantContext.getChurchId();
        long total = memberRepository.countActiveMembersByChurchId(churchId);
        return ResponseEntity.ok(Map.of("totalMembers", total, "activeMembers", total));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<MemberDto>> searchMembers(@RequestParam String search, Pageable pageable) {
        Page<MemberDto> members = memberService.searchMembers(search, pageable);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberDto> getMemberById(@PathVariable Long id) {
        MemberDto member = memberService.getMemberById(id);
        return ResponseEntity.ok(member);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY')")
    public ResponseEntity<MemberDto> createMember(@Valid @RequestBody MemberDto memberDto) {
        MemberDto member = memberService.createMember(memberDto);
        return ResponseEntity.ok(member);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY')")
    public ResponseEntity<MemberDto> updateMember(@PathVariable Long id, @Valid @RequestBody MemberDto memberDto) {
        MemberDto member = memberService.updateMember(id, memberDto);
        return ResponseEntity.ok(member);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.ok().build();
    }
}
