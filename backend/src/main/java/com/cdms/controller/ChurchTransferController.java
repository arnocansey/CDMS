package com.cdms.controller;

import com.cdms.entity.Church;
import com.cdms.entity.ChurchTransfer;
import com.cdms.exception.BadRequestException;
import com.cdms.repository.ChurchRepository;
import com.cdms.security.TenantContext;
import com.cdms.service.ChurchTransferService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/church-transfers")
public class ChurchTransferController {

    private final ChurchTransferService churchTransferService;
    private final ChurchRepository churchRepository;

    public ChurchTransferController(ChurchTransferService churchTransferService,
                                    ChurchRepository churchRepository) {
        this.churchTransferService = churchTransferService;
        this.churchRepository = churchRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<Map<String, Object>> requestTransfer(@RequestBody Map<String, Object> body) {
        if (body.get("memberId") == null) {
            throw new BadRequestException("memberId is required");
        }
        Long memberId = Long.valueOf(body.get("memberId").toString());
        Long toChurchId = resolveToChurchId(body);
        String reason = body.get("reason") != null ? body.get("reason").toString() : null;
        ChurchTransfer transfer = churchTransferService.requestTransfer(memberId, toChurchId, reason);
        return ResponseEntity.ok(toTransferMap(transfer));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<Map<String, Object>> approveTransfer(@PathVariable Long id) {
        ChurchTransfer transfer = churchTransferService.approveTransfer(id, "admin");
        return ResponseEntity.ok(toTransferMap(transfer));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<Map<String, Object>> rejectTransfer(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        ChurchTransfer transfer = churchTransferService.rejectTransfer(id, reason);
        return ResponseEntity.ok(toTransferMap(transfer));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<List<Map<String, Object>>> getTransfers() {
        Long churchId = TenantContext.requireChurchId();
        List<ChurchTransfer> transfers = churchTransferService.getTransfers(churchId);
        return ResponseEntity.ok(transfers.stream().map(this::toTransferMap).toList());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<List<Map<String, Object>>> getPendingTransfers() {
        Long churchId = TenantContext.requireChurchId();
        List<ChurchTransfer> transfers = churchTransferService.getPendingTransfers(churchId);
        return ResponseEntity.ok(transfers.stream().map(this::toTransferMap).toList());
    }

    private Long resolveToChurchId(Map<String, Object> body) {
        if (body.get("toChurchId") != null) {
            return Long.valueOf(body.get("toChurchId").toString());
        }
        Object target = body.get("targetChurch");
        if (target == null || target.toString().isBlank()) {
            throw new BadRequestException("toChurchId or targetChurch is required");
        }
        String value = target.toString().trim();
        if (value.matches("\\d+")) {
            return Long.valueOf(value);
        }
        return churchRepository.findBySlug(value)
                .or(() -> churchRepository.findAll().stream()
                        .filter(c -> value.equalsIgnoreCase(c.getName()))
                        .findFirst())
                .map(Church::getId)
                .orElseThrow(() -> new BadRequestException("Target church not found: " + value));
    }

    private Map<String, Object> toTransferMap(ChurchTransfer transfer) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", transfer.getId());
        map.put("status", transfer.getStatus());
        map.put("reason", transfer.getReason());
        map.put("createdAt", transfer.getCreatedAt());
        map.put("transferDate", transfer.getTransferDate());
        map.put("fromChurchId", transfer.getFromChurchId());
        map.put("toChurchId", transfer.getToChurchId());

        if (transfer.getMember() != null) {
            String name = ((transfer.getMember().getFirstName() != null ? transfer.getMember().getFirstName() : "")
                    + " "
                    + (transfer.getMember().getLastName() != null ? transfer.getMember().getLastName() : "")).trim();
            map.put("memberName", name.isBlank() ? transfer.getMember().getEmail() : name);
            map.put("memberId", transfer.getMember().getId());
        } else {
            map.put("memberName", "—");
        }

        map.put("fromChurch", churchRepository.findById(transfer.getFromChurchId()).map(Church::getName).orElse("#" + transfer.getFromChurchId()));
        map.put("toChurch", churchRepository.findById(transfer.getToChurchId()).map(Church::getName).orElse("#" + transfer.getToChurchId()));
        return map;
    }
}
