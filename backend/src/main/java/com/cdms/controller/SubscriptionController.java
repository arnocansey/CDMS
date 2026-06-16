package com.cdms.controller;

import com.cdms.entity.PaymentTransaction;
import com.cdms.entity.SubscriptionPlan;
import com.cdms.entity.User;
import com.cdms.repository.SubscriptionPlanRepository;
import com.cdms.security.TenantContext;
import com.cdms.service.PaystackService;
import com.cdms.service.TenantService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final PaystackService paystackService;
    private final TenantService tenantService;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    public SubscriptionController(PaystackService paystackService,
                                  TenantService tenantService,
                                  SubscriptionPlanRepository subscriptionPlanRepository) {
        this.paystackService = paystackService;
        this.tenantService = tenantService;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
    }

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlan>> getPlans() {
        return ResponseEntity.ok(subscriptionPlanRepository.findAll());
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<SubscriptionPlan> getPlan(@PathVariable Long id) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new com.cdms.exception.ResourceNotFoundException("Plan not found"));
        return ResponseEntity.ok(plan);
    }

    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> initializePayment(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal User currentUser) {
        Long churchId = TenantContext.getChurchId();
        Long planId = Long.valueOf(request.get("planId").toString());
        String billingCycle = request.getOrDefault("billingCycle", "MONTHLY").toString();

        Map<String, Object> result = paystackService.initializeTransaction(churchId, currentUser.getId(), planId, billingCycle);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/verify/{reference}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> verifyPayment(@PathVariable String reference) {
        Map<String, Object> result = paystackService.verifyTransaction(reference);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<List<PaymentTransaction>> getPaymentHistory() {
        Long churchId = TenantContext.getChurchId();
        return ResponseEntity.ok(paystackService.getPaymentHistory(churchId));
    }

    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        return ResponseEntity.ok(Map.of("publicKey", paystackService.getPublicKey()));
    }

    @PostMapping("/webhooks/paystack")
    public ResponseEntity<String> handleWebhook(@RequestBody JsonNode payload,
                                                 @RequestHeader("X-Paystack-Signature") String signature) {
        String eventType = payload.has("event") ? payload.get("event").asText() : "unknown";

        paystackService.handleWebhookEvent(eventType, payload);

        return ResponseEntity.ok("OK");
    }
}
