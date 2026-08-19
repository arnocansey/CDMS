package com.cdms.controller;

import com.cdms.security.TenantContext;
import com.cdms.service.PaystackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/finance/paystack")
public class PaystackGivingController {

    private final PaystackService paystackService;

    public PaystackGivingController(PaystackService paystackService) {
        this.paystackService = paystackService;
    }

    @PostMapping("/initialize-giving")
    public ResponseEntity<Map<String, Object>> initializeOnlineGiving(@RequestBody Map<String, Object> request) {
        Long churchId = TenantContext.getChurchId();
        if (request.containsKey("churchId") && request.get("churchId") != null) {
            churchId = Long.valueOf(request.get("churchId").toString());
        }

        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        String category = request.getOrDefault("category", "DONATION").toString();
        String email = request.getOrDefault("email", "").toString();
        String callbackUrl = request.getOrDefault("callbackUrl", "").toString();

        Map<String, Object> result = paystackService.initializeGivingTransaction(
                churchId, amount, category, email, callbackUrl);

        return ResponseEntity.ok(result);
    }
}
