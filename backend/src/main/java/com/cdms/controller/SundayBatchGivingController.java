package com.cdms.controller;

import com.cdms.dto.DonationDto;
import com.cdms.dto.OfferingDto;
import com.cdms.dto.TitheDto;
import com.cdms.service.FinancialService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance/sunday-batch")
public class SundayBatchGivingController {

    private final FinancialService financialService;

    public SundayBatchGivingController(FinancialService financialService) {
        this.financialService = financialService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'SECRETARY')")
    @Transactional
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> recordSundayBatch(@RequestBody Map<String, Object> request) {
        LocalDate date = request.containsKey("serviceDate") && request.get("serviceDate") != null
                ? LocalDate.parse(request.get("serviceDate").toString())
                : LocalDate.now();

        String serviceName = request.getOrDefault("serviceName", "Sunday Service").toString();
        int recordsCreated = 0;

        // 1st Offering (General)
        if (request.containsKey("firstOffering") && request.get("firstOffering") != null) {
            BigDecimal amt = new BigDecimal(request.get("firstOffering").toString());
            if (amt.compareTo(BigDecimal.ZERO) > 0) {
                OfferingDto offering = new OfferingDto();
                offering.setAmount(amt);
                offering.setServiceDate(date);
                offering.setServiceType(serviceName + " - 1st Offering");
                offering.setDescription("Batch Sunday Collection");
                financialService.createOffering(offering);
                recordsCreated++;
            }
        }

        // 2nd Offering / Special Seed
        if (request.containsKey("secondOffering") && request.get("secondOffering") != null) {
            BigDecimal amt = new BigDecimal(request.get("secondOffering").toString());
            if (amt.compareTo(BigDecimal.ZERO) > 0) {
                OfferingDto offering = new OfferingDto();
                offering.setAmount(amt);
                offering.setServiceDate(date);
                offering.setServiceType(serviceName + " - 2nd Offering / Seed");
                offering.setDescription("Batch Sunday Special Seed");
                financialService.createOffering(offering);
                recordsCreated++;
            }
        }

        // Building & Project Fund
        if (request.containsKey("buildingFund") && request.get("buildingFund") != null) {
            BigDecimal amt = new BigDecimal(request.get("buildingFund").toString());
            if (amt.compareTo(BigDecimal.ZERO) > 0) {
                DonationDto donation = new DonationDto();
                donation.setAmount(amt);
                donation.setDonationDate(date);
                donation.setCategory("BUILDING_FUND");
                donation.setDescription("Sunday Collection - Building & Facilities Fund");
                financialService.createDonation(donation);
                recordsCreated++;
            }
        }

        // Welfare Contribution
        if (request.containsKey("welfareFund") && request.get("welfareFund") != null) {
            BigDecimal amt = new BigDecimal(request.get("welfareFund").toString());
            if (amt.compareTo(BigDecimal.ZERO) > 0) {
                DonationDto donation = new DonationDto();
                donation.setAmount(amt);
                donation.setDonationDate(date);
                donation.setCategory("WELFARE");
                donation.setDescription("Sunday Collection - Welfare Contribution");
                financialService.createDonation(donation);
                recordsCreated++;
            }
        }

        // Member Envelope Tithes
        if (request.containsKey("tithes") && request.get("tithes") instanceof List) {
            List<Map<String, Object>> titheList = (List<Map<String, Object>>) request.get("tithes");
            for (Map<String, Object> t : titheList) {
                if (t.get("amount") != null) {
                    BigDecimal amt = new BigDecimal(t.get("amount").toString());
                    if (amt.compareTo(BigDecimal.ZERO) > 0) {
                        TitheDto tithe = new TitheDto();
                        tithe.setAmount(amt);
                        tithe.setTitheDate(date);
                        if (t.get("memberId") != null && !t.get("memberId").toString().isBlank()) {
                            tithe.setMemberId(Long.valueOf(t.get("memberId").toString()));
                        }
                        String env = t.getOrDefault("envelopeNumber", "").toString();
                        tithe.setReferenceNumber(env.isBlank() ? "SUNDAY-ENVELOPE" : "ENV-" + env);
                        tithe.setPaymentMethod("CASH");
                        financialService.createTithe(tithe);
                        recordsCreated++;
                    }
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Sunday Service batch entry recorded successfully!");
        response.put("recordsCreated", recordsCreated);
        return ResponseEntity.ok(response);
    }
}
