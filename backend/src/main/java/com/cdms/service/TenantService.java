package com.cdms.service;

import com.cdms.entity.Church;
import com.cdms.entity.ChurchSubscription;
import com.cdms.entity.SubscriptionPlan;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.ChurchRepository;
import com.cdms.repository.ChurchSubscriptionRepository;
import com.cdms.repository.SubscriptionPlanRepository;
import com.cdms.security.TenantContext;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class TenantService {

    private final ChurchRepository churchRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final ChurchSubscriptionRepository churchSubscriptionRepository;

    public TenantService(ChurchRepository churchRepository,
                         SubscriptionPlanRepository subscriptionPlanRepository,
                         ChurchSubscriptionRepository churchSubscriptionRepository) {
        this.churchRepository = churchRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.churchSubscriptionRepository = churchSubscriptionRepository;
    }

    public Church getCurrentChurch() {
        Long churchId = TenantContext.getChurchId();
        if (churchId == null) {
            throw new BadRequestException("No church context set");
        }
        return churchRepository.findById(churchId)
                .orElseThrow(() -> new ResourceNotFoundException("Church not found"));
    }

    public ChurchSubscription getCurrentSubscription() {
        Church church = getCurrentChurch();
        return churchSubscriptionRepository.findByChurchIdAndStatus(church.getId(), "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("No active subscription found for church"));
    }

    public SubscriptionPlan getCurrentPlan() {
        ChurchSubscription subscription = getCurrentSubscription();
        return subscriptionPlanRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));
    }

    public boolean isFeatureEnabled(String feature) {
        try {
            SubscriptionPlan plan = getCurrentPlan();
            String features = plan.getFeatures();
            if (features == null) return false;
            if (features.contains("\"all\"")) return true;
            return features.contains("\"" + feature + "\"");
        } catch (Exception e) {
            return false;
        }
    }

    public Church getChurchBySlug(String slug) {
        return churchRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Church not found with slug: " + slug));
    }

    public Church createChurch(Church church, String planName) {
        Church savedChurch = churchRepository.save(church);

        SubscriptionPlan plan = subscriptionPlanRepository.findByName(planName)
                .orElseThrow(() -> new BadRequestException("Plan not found: " + planName));

        ChurchSubscription subscription = new ChurchSubscription();
        subscription.setChurchId(savedChurch.getId());
        subscription.setPlanId(plan.getId());
        subscription.setStatus("ACTIVE");
        subscription.setBillingCycle("MONTHLY");
        subscription.setStartDate(LocalDate.now());
        churchSubscriptionRepository.save(subscription);

        return savedChurch;
    }
}
