package com.cdms.service;

import com.cdms.entity.PushSubscription;
import com.cdms.repository.PushSubscriptionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PushNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PushNotificationService.class);
    private static final int GCM_TAG_LENGTH = 128;

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final ObjectMapper objectMapper;

    @Value("${vapid.public.key:}")
    private String vapidPublicKey;

    @Value("${vapid.private.key:}")
    private String vapidPrivateKey;

    @Value("${vapid.subject:mailto:admin@cdms.com}")
    private String vapidSubject;

    @Value("${app.name:Church Financial Management System}")
    private String appName;

    public PushNotificationService(PushSubscriptionRepository pushSubscriptionRepository,
                                   ObjectMapper objectMapper) {
        this.pushSubscriptionRepository = pushSubscriptionRepository;
        this.objectMapper = objectMapper;
    }

    public PushSubscription registerSubscription(Long userId, String endpoint, String p256dh, String auth, String userAgent) {
        Optional<PushSubscription> existing = pushSubscriptionRepository.findByEndpoint(endpoint);

        if (existing.isPresent()) {
            PushSubscription sub = existing.get();
            sub.setUserId(userId);
            sub.setP256dh(p256dh);
            sub.setAuth(auth);
            sub.setActive(true);
            return pushSubscriptionRepository.save(sub);
        }

        Long churchId = 1L;
        PushSubscription subscription = new PushSubscription(churchId, userId, endpoint, p256dh, auth, userAgent);
        return pushSubscriptionRepository.save(subscription);
    }

    public void unregister(String endpoint) {
        pushSubscriptionRepository.findByEndpoint(endpoint)
                .ifPresent(sub -> {
                    sub.setActive(false);
                    pushSubscriptionRepository.save(sub);
                });
    }

    @Async
    public void sendNotification(Long userId, String title, String body, String url) {
        List<PushSubscription> subscriptions = pushSubscriptionRepository.findByUserIdAndActive(userId, true);

        if (subscriptions.isEmpty()) {
            logger.debug("No active push subscriptions for user {}", userId);
            return;
        }

        if (vapidPublicKey == null || vapidPublicKey.isBlank() || vapidPrivateKey == null || vapidPrivateKey.isBlank()) {
            logger.warn("VAPID keys not configured. Push notification skipped for user {}", userId);
            return;
        }

        try {
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("title", title);
            payloadMap.put("body", body);
            if (url != null) {
                payloadMap.put("url", url);
            }
            String payload = objectMapper.writeValueAsString(payloadMap);

            HttpClient httpClient = HttpClient.newHttpClient();

            for (PushSubscription subscription : subscriptions) {
                try {
                    sendWebPush(httpClient, subscription, payload);
                } catch (Exception e) {
                    logger.error("Failed to send push notification to endpoint {}: {}", subscription.getEndpoint(), e.getMessage());
                    if (e.getMessage() != null && (e.getMessage().contains("404") || e.getMessage().contains("410"))) {
                        subscription.setActive(false);
                        pushSubscriptionRepository.save(subscription);
                        logger.info("Deactivated expired push subscription for user {}", userId);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error sending push notifications to user {}: {}", userId, e.getMessage());
        }
    }

    private void sendWebPush(HttpClient httpClient, PushSubscription subscription, String payload) throws Exception {
        String endpoint = subscription.getEndpoint();

        byte[] payloadBytes = payload.getBytes(StandardCharsets.UTF_8);

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/octet-stream")
                .header("TTL", "86400")
                .POST(HttpRequest.BodyPublishers.ofByteArray(payloadBytes));

        if (vapidPublicKey != null && !vapidPublicKey.isBlank()) {
            requestBuilder.header("Authorization", "vapid t=" + generateVapidToken() + ", k=" + vapidPublicKey);
        }

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new RuntimeException("Web push failed with status " + response.statusCode() + ": " + response.body());
        }
    }

    private String generateVapidToken() {
        try {
            Map<String, String> header = Map.of("typ", "JWT", "alg", "ES256");
            Map<String, Object> claims = Map.of(
                    "aud", URI.create(vapidSubject.startsWith("mailto:") ? vapidSubject.substring(7) : vapidSubject).toString(),
                    "exp", Instant.now().plusSeconds(12 * 60 * 60).getEpochSecond(),
                    "sub", vapidSubject
            );

            String headerJson = objectMapper.writeValueAsString(header);
            String claimsJson = objectMapper.writeValueAsString(claims);

            String encodedHeader = Base64.getUrlEncoder().withoutPadding().encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));
            String encodedClaims = Base64.getUrlEncoder().withoutPadding().encodeToString(claimsJson.getBytes(StandardCharsets.UTF_8));

            return encodedHeader + "." + encodedClaims + ".signature";
        } catch (Exception e) {
            logger.error("Error generating VAPID token: {}", e.getMessage());
            return "";
        }
    }

    public void notifyNewDonation(Long churchId, BigDecimal amount, String donorName) {
        List<PushSubscription> adminSubscriptions = pushSubscriptionRepository.findByChurchIdAndActive(churchId, true);

        String title = "New Donation Received";
        String body = String.format("%s donated $%s to the church.", donorName, amount);
        String url = "/finance/donations";

        sendNotificationToSubscriptions(adminSubscriptions, title, body, url);
    }

    public void notifyExpensePending(Long churchId, String description, BigDecimal amount) {
        List<PushSubscription> adminSubscriptions = pushSubscriptionRepository.findByChurchIdAndActive(churchId, true);

        String title = "Expense Pending Approval";
        String body = String.format("New expense: %s - $%s requires approval.", description, amount);
        String url = "/finance/expenses";

        sendNotificationToSubscriptions(adminSubscriptions, title, body, url);
    }

    public void notifyApprovalStatus(Long userId, String status) {
        List<PushSubscription> userSubscriptions = pushSubscriptionRepository.findByUserIdAndActive(userId, true);

        String title = "Approval Status Update";
        String body = "Your expense has been " + status.toLowerCase() + ".";
        String url = "/finance/expenses";

        sendNotificationToSubscriptions(userSubscriptions, title, body, url);
    }

    @Async
    private void sendNotificationToSubscriptions(List<PushSubscription> subscriptions, String title, String body, String url) {
        if (subscriptions.isEmpty()) {
            return;
        }

        if (vapidPublicKey == null || vapidPublicKey.isBlank()) {
            logger.warn("VAPID keys not configured. Push notifications skipped.");
            return;
        }

        try {
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("title", title);
            payloadMap.put("body", body);
            if (url != null) {
                payloadMap.put("url", url);
            }
            String payload = objectMapper.writeValueAsString(payloadMap);

            HttpClient httpClient = HttpClient.newHttpClient();
            for (PushSubscription subscription : subscriptions) {
                try {
                    sendWebPush(httpClient, subscription, payload);
                } catch (Exception e) {
                    logger.error("Failed to send push notification: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Error sending push notifications: {}", e.getMessage());
        }
    }
}
