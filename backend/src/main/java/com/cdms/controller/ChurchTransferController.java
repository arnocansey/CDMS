package com.cdms.controller;

import com.cdms.entity.ChurchTransfer;
import com.cdms.security.TenantContext;
import com.cdms.service.ChurchTransferService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/church-transfers")
public class ChurchTransferController {

    private final ChurchTransferService churchTransferService;

    public ChurchTransferController(ChurchTransferService churchTransferService) {
        this.churchTransferService = churchTransferService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<ChurchTransfer> requestTransfer(@RequestBody Map<String, Object> body) {
        Long churchId = TenantContext.getChurchId();
        Long memberId = Long.valueOf(body.get("memberId").toString());
        Long toChurchId = Long.valueOf(body.get("toChurchId").toString());
        String reason = (String) body.get("reason");
        ChurchTransfer transfer = churchTransferService.requestTransfer(memberId, toChurchId, reason);
        return ResponseEntity.ok(transfer);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<ChurchTransfer> approveTransfer(@PathVariable Long id) {
        ChurchTransfer transfer = churchTransferService.approveTransfer(id, "admin");
        return ResponseEntity.ok(transfer);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<ChurchTransfer> rejectTransfer(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        ChurchTransfer transfer = churchTransferService.rejectTransfer(id, reason);
        return ResponseEntity.ok(transfer);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<List<ChurchTransfer>> getTransfers() {
        Long churchId = TenantContext.getChurchId();
        List<ChurchTransfer> transfers = churchTransferService.getTransfers(churchId);
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<List<ChurchTransfer>> getPendingTransfers() {
        Long churchId = TenantContext.getChurchId();
        List<ChurchTransfer> transfers = churchTransferService.getPendingTransfers(churchId);
        return ResponseEntity.ok(transfers);
    }
}
