package com.cdms.controller;

import com.cdms.entity.PaymentTransaction;
import com.cdms.entity.SubscriptionPlan;
import com.cdms.entity.User;
import com.cdms.exception.BadRequestException;
import com.cdms.repository.SubscriptionPlanRepository;
import com.cdms.repository.UserRepository;
import com.cdms.security.SecurityUtils;
import com.cdms.security.TenantContext;
import com.cdms.service.PaystackService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final PaystackService paystackService;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final UserRepository userRepository;

    public SubscriptionController(PaystackService paystackService,
                                  SubscriptionPlanRepository subscriptionPlanRepository,
                                  UserRepository userRepository) {
        this.paystackService = paystackService;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.userRepository = userRepository;
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
    public ResponseEntity<Map<String, Object>> initializePayment(@RequestBody Map<String, Object> request) {
        User user = requireCurrentUser();
        Long churchId = resolveChurchId(user);
        Long planId = Long.valueOf(request.get("planId").toString());
        String billingCycle = request.getOrDefault("billingCycle", "MONTHLY").toString();

        Map<String, Object> result = paystackService.initializeTransaction(
                churchId, user.getId(), planId, billingCycle, user.getEmail());
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
        User user = requireCurrentUser();
        Long churchId = resolveChurchId(user);
        return ResponseEntity.ok(paystackService.getPaymentHistory(churchId));
    }

    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        return ResponseEntity.ok(Map.of("publicKey", paystackService.getPublicKey()));
    }

    @PostMapping("/webhooks/paystack")
    public ResponseEntity<String> handleWebhook(@RequestBody JsonNode payload,
                                                 @RequestHeader(value = "X-Paystack-Signature", required = false) String signature) {
        String eventType = payload.has("event") ? payload.get("event").asText() : "unknown";
        paystackService.handleWebhookEvent(eventType, payload);
        return ResponseEntity.ok("OK");
    }

    private User requireCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Not authenticated");
        }
        return userRepository.findByEmailWithDetails(email)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    private Long resolveChurchId(User user) {
        Long churchId = TenantContext.getChurchId();
        if (churchId == null) {
            churchId = user.getChurchId();
        }
        if (churchId == null) {
            throw new BadRequestException("No church associated with your account. Re-login or contact support.");
        }
        TenantContext.setChurchId(churchId);
        return churchId;
    }
}
