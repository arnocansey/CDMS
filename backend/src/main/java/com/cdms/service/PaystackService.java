package com.cdms.service;

import com.cdms.config.PaystackConfig;
import com.cdms.entity.Church;
import com.cdms.entity.ChurchSubscription;
import com.cdms.entity.PaymentTransaction;
import com.cdms.entity.SubscriptionPlan;
import com.cdms.exception.BadRequestException;
import com.cdms.repository.ChurchRepository;
import com.cdms.repository.ChurchSubscriptionRepository;
import com.cdms.repository.PaymentTransactionRepository;
import com.cdms.repository.SubscriptionPlanRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaystackService {

    private static final Logger log = LoggerFactory.getLogger(PaystackService.class);

    private final WebClient webClient;
    private final PaystackConfig paystackConfig;
    private final ChurchRepository churchRepository;
    private final ChurchSubscriptionRepository churchSubscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ObjectMapper objectMapper;

    public PaystackService(WebClient paystackWebClient,
                           PaystackConfig paystackConfig,
                           ChurchRepository churchRepository,
                           ChurchSubscriptionRepository churchSubscriptionRepository,
                           SubscriptionPlanRepository subscriptionPlanRepository,
                           PaymentTransactionRepository paymentTransactionRepository,
                           ObjectMapper objectMapper) {
        this.webClient = paystackWebClient;
        this.paystackConfig = paystackConfig;
        this.churchRepository = churchRepository;
        this.churchSubscriptionRepository = churchSubscriptionRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Map<String, Object> initializeTransaction(Long churchId, Long userId, Long planId,
                                                     String billingCycle, String payerEmail) {
        ensurePaystackConfigured();

        Church church = churchRepository.findById(churchId)
                .orElseThrow(() -> new BadRequestException("Church not found"));

        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new BadRequestException("Plan not found"));

        if ("Free".equalsIgnoreCase(plan.getName())) {
            throw new BadRequestException("Cannot initialize payment for Free plan");
        }

        BigDecimal amount = "ANNUAL".equalsIgnoreCase(billingCycle) ? plan.getPriceAnnual() : plan.getPriceMonthly();
        String currency = resolveCurrency(church);

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Invalid plan amount");
        }

        String email = resolvePayerEmail(church, payerEmail);
        String reference = "CDMS-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        long amountMinorUnits = amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        PaymentTransaction transaction = new PaymentTransaction(churchId, userId, planId, amount, currency, billingCycle);
        transaction.setPaystackReference(reference);
        paymentTransactionRepository.save(transaction);

        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("church_id", churchId);
            metadata.put("plan_id", planId);
            metadata.put("plan_name", plan.getName());
            metadata.put("billing_cycle", billingCycle);
            metadata.put("church_name", church.getName());

            Map<String, Object> body = new HashMap<>();
            body.put("email", email);
            body.put("amount", amountMinorUnits);
            body.put("currency", currency);
            body.put("reference", reference);
            body.put("callback_url", paystackConfig.getCallbackUrl());
            body.put("metadata", metadata);

            JsonNode response = webClient.post()
                    .uri("/transaction/initialize")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.path("status").asBoolean(false)) {
                JsonNode data = response.get("data");
                transaction.setPaystackAccessCode(data.get("access_code").asText());
                paymentTransactionRepository.save(transaction);

                Map<String, Object> result = new HashMap<>();
                result.put("status", true);
                result.put("authorization_url", data.get("authorization_url").asText());
                result.put("access_code", data.get("access_code").asText());
                result.put("reference", reference);
                result.put("amount", amountMinorUnits);
                result.put("currency", currency);
                result.put("email", email);
                return result;
            }

            String message = response != null ? response.path("message").asText("Unknown error") : "Unknown error";
            throw new BadRequestException("Paystack initialization failed: " + message);
        } catch (BadRequestException e) {
            throw e;
        } catch (WebClientResponseException e) {
            log.error("Paystack HTTP error: status={} body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BadRequestException(parsePaystackError(e));
        } catch (Exception e) {
            log.error("Paystack initialization error", e);
            throw new BadRequestException("Payment initialization failed: " +
                    (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
        }
    }

    /** @deprecated use overload with payerEmail */
    @Transactional
    public Map<String, Object> initializeTransaction(Long churchId, Long userId, Long planId, String billingCycle) {
        return initializeTransaction(churchId, userId, planId, billingCycle, null);
    }

    @Transactional
    public Map<String, Object> initializeGivingTransaction(Long churchId, BigDecimal amount, String category, String payerEmail, String callbackUrl) {
        ensurePaystackConfigured();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Invalid giving amount");
        }

        Church church = churchId != null ? churchRepository.findById(churchId).orElse(null) : null;
        String currency = church != null ? resolveCurrency(church) : "NGN";
        String email = StringUtils.hasText(payerEmail) ? payerEmail.trim() : (church != null ? resolvePayerEmail(church, null) : "donor@church.com");
        String reference = "GIVE-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        long amountMinorUnits = amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("church_id", churchId);
            metadata.put("category", category);
            metadata.put("type", "ONLINE_GIVING");

            Map<String, Object> body = new HashMap<>();
            body.put("email", email);
            body.put("amount", amountMinorUnits);
            body.put("currency", currency);
            body.put("reference", reference);
            body.put("callback_url", StringUtils.hasText(callbackUrl) ? callbackUrl : paystackConfig.getCallbackUrl());
            body.put("metadata", metadata);

            JsonNode response = webClient.post()
                    .uri("/transaction/initialize")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.path("status").asBoolean(false)) {
                JsonNode data = response.get("data");
                Map<String, Object> result = new HashMap<>();
                result.put("status", true);
                result.put("authorization_url", data.get("authorization_url").asText());
                result.put("access_code", data.get("access_code").asText());
                result.put("reference", reference);
                result.put("amount", amount);
                result.put("currency", currency);
                return result;
            }

            String message = response != null ? response.path("message").asText("Unknown error") : "Unknown error";
            throw new BadRequestException("Paystack initialization failed: " + message);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Paystack giving initialization error", e);
            throw new BadRequestException("Giving payment initialization failed: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> verifyTransaction(String reference) {
        PaymentTransaction transaction = paymentTransactionRepository.findByPaystackReference(reference)
                .orElseThrow(() -> new BadRequestException("Transaction not found with reference: " + reference));

        if ("COMPLETED".equals(transaction.getStatus())) {
            return Map.of(
                    "status", true,
                    "message", "Transaction already verified",
                    "reference", reference
            );
        }

        try {
            JsonNode response = webClient.get()
                    .uri("/transaction/verify/{reference}", reference)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.path("status").asBoolean(false)) {
                JsonNode data = response.get("data");
                String paystackStatus = data.get("status").asText();

                transaction.setPaystackResponse(data.toString());

                if ("success".equals(paystackStatus)) {
                    transaction.setStatus("COMPLETED");
                    transaction.setPaidAt(LocalDateTime.now());
                    if (data.has("authorization")) {
                        JsonNode auth = data.get("authorization");
                        transaction.setPaymentMethod(auth.has("card_type") ? auth.get("card_type").asText() : "card");
                        if (auth.has("authorization_code")) {
                            transaction.setPaystackAuthorizationCode(auth.get("authorization_code").asText());
                        }
                    }
                    paymentTransactionRepository.save(transaction);

                    activateSubscription(transaction);

                    return Map.of(
                            "status", true,
                            "message", "Payment verified and subscription activated",
                            "reference", reference,
                            "amount", transaction.getAmount(),
                            "currency", transaction.getCurrency()
                    );
                } else {
                    transaction.setStatus("FAILED");
                    paymentTransactionRepository.save(transaction);
                    throw new BadRequestException("Payment verification failed: " + paystackStatus);
                }
            } else {
                throw new BadRequestException("Could not verify transaction with Paystack");
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (WebClientResponseException e) {
            log.error("Paystack verify HTTP error: status={} body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BadRequestException(parsePaystackError(e));
        } catch (Exception e) {
            log.error("Paystack verification error", e);
            throw new BadRequestException("Verification failed: " + e.getMessage());
        }
    }

    @Transactional
    public void handleWebhookEvent(String eventType, JsonNode payload) {
        log.info("Processing Paystack webhook: {}", eventType);

        switch (eventType) {
            case "charge.success" -> handleChargeSuccess(payload);
            case "invoice.payment" -> handleInvoicePayment(payload);
            case "subscription.create" -> handleSubscriptionCreate(payload);
            case "subscription.disable" -> handleSubscriptionDisable(payload);
            default -> log.info("Unhandled Paystack event: {}", eventType);
        }
    }

    private void handleChargeSuccess(JsonNode payload) {
        JsonNode data = payload.get("data");
        if (data == null) return;

        String reference = data.has("reference") ? data.get("reference").asText() : null;
        if (reference == null) return;

        Optional<PaymentTransaction> existing = paymentTransactionRepository.findByPaystackReference(reference);
        if (existing.isPresent() && "COMPLETED".equals(existing.get().getStatus())) {
            log.info("Transaction {} already processed", reference);
            return;
        }

        PaymentTransaction transaction;
        if (existing.isPresent()) {
            transaction = existing.get();
        } else {
            JsonNode metadata = data.has("metadata") ? data.get("metadata") : null;
            Long churchId = null;
            Long planId = null;
            String billingCycle = "MONTHLY";

            if (metadata != null && metadata.has("church_id")) {
                churchId = metadata.get("church_id").asLong();
            }
            if (metadata != null && metadata.has("plan_id")) {
                planId = metadata.get("plan_id").asLong();
            }
            if (metadata != null && metadata.has("billing_cycle")) {
                billingCycle = metadata.get("billing_cycle").asText();
            }

            if (churchId == null || planId == null) {
                log.warn("Missing metadata in webhook for reference: {}", reference);
                return;
            }

            BigDecimal amount = BigDecimal.valueOf(data.get("amount").asLong()).divide(BigDecimal.valueOf(100));
            String currency = data.has("currency") ? data.get("currency").asText() : "NGN";

            transaction = new PaymentTransaction(churchId, 0L, planId, amount, currency, billingCycle);
            transaction.setPaystackReference(reference);
        }

        transaction.setStatus("COMPLETED");
        transaction.setPaidAt(LocalDateTime.now());
        transaction.setPaystackResponse(data.toString());

        if (data.has("authorization")) {
            JsonNode auth = data.get("authorization");
            transaction.setPaymentMethod(auth.has("card_type") ? auth.get("card_type").asText() : "card");
            if (auth.has("authorization_code")) {
                transaction.setPaystackAuthorizationCode(auth.get("authorization_code").asText());
            }
        }

        paymentTransactionRepository.save(transaction);
        activateSubscription(transaction);
    }

    private void handleInvoicePayment(JsonNode payload) {
        log.info("Invoice payment webhook received");
    }

    private void handleSubscriptionCreate(JsonNode payload) {
        log.info("Subscription create webhook received");
    }

    private void handleSubscriptionDisable(JsonNode payload) {
        log.info("Subscription disable webhook received");
    }

    private void activateSubscription(PaymentTransaction transaction) {
        Church church = churchRepository.findById(transaction.getChurchId()).orElse(null);
        if (church == null) return;

        churchSubscriptionRepository.findByChurchIdAndStatus(church.getId(), "ACTIVE")
                .ifPresent(sub -> {
                    sub.setStatus("INACTIVE");
                    churchSubscriptionRepository.save(sub);
                });

        SubscriptionPlan plan = subscriptionPlanRepository.findById(transaction.getPlanId()).orElse(null);
        if (plan == null) return;

        ChurchSubscription subscription = new ChurchSubscription();
        subscription.setChurchId(church.getId());
        subscription.setPlanId(plan.getId());
        subscription.setStatus("ACTIVE");
        subscription.setBillingCycle(transaction.getBillingCycle());

        LocalDate startDate = LocalDate.now();
        subscription.setStartDate(startDate);

        if ("ANNUAL".equals(transaction.getBillingCycle())) {
            subscription.setEndDate(startDate.plusYears(1));
        } else {
            subscription.setEndDate(startDate.plusMonths(1));
        }

        churchSubscriptionRepository.save(subscription);
        log.info("Activated {} plan for church {} (ref: {})", plan.getName(), church.getId(), transaction.getPaystackReference());
    }

    public String getPublicKey() {
        return paystackConfig.getPublicKey() != null ? paystackConfig.getPublicKey() : "";
    }

    @Transactional(readOnly = true)
    public java.util.List<PaymentTransaction> getPaymentHistory(Long churchId) {
        return paymentTransactionRepository.findByChurchIdOrderByCreatedAtDesc(churchId);
    }

    @Transactional(readOnly = true)
    public Optional<PaymentTransaction> getTransactionByReference(String reference) {
        return paymentTransactionRepository.findByPaystackReference(reference);
    }

    private void ensurePaystackConfigured() {
        if (!StringUtils.hasText(paystackConfig.getSecretKey()) || !StringUtils.hasText(paystackConfig.getPublicKey())) {
            throw new BadRequestException(
                    "Payment provider is not configured. Set PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY on the server.");
        }
    }

    private String resolvePayerEmail(Church church, String payerEmail) {
        if (StringUtils.hasText(payerEmail)) {
            return payerEmail.trim();
        }
        if (StringUtils.hasText(church.getEmail())) {
            return church.getEmail().trim();
        }
        if (StringUtils.hasText(church.getEmailFromAddress())) {
            return church.getEmailFromAddress().trim();
        }
        throw new BadRequestException(
                "A billing email is required. Set your church email in Settings, or ensure your account email is valid.");
    }

    private String resolveCurrency(Church church) {
        String currency = church.getCurrency();
        if (!StringUtils.hasText(currency)) {
            return "NGN";
        }
        return currency.trim().toUpperCase();
    }

    private String parsePaystackError(WebClientResponseException e) {
        try {
            JsonNode body = objectMapper.readTree(e.getResponseBodyAsString());
            String message = body.path("message").asText(null);
            if (StringUtils.hasText(message)) {
                return "Paystack error: " + message;
            }
        } catch (Exception ignored) {
            // fall through
        }
        return "Paystack request failed (" + e.getStatusCode().value() + "). Check API keys and currency support.";
    }
}
