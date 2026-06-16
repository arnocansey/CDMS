package com.cdms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class PaystackConfig {

    @Value("${paystack.secret-key}")
    private String secretKey;

    @Value("${paystack.public-key}")
    private String publicKey;

    @Value("${paystack.webhook-secret:}")
    private String webhookSecret;

    @Value("${paystack.callback-url:http://localhost:3000/dashboard/subscription}")
    private String callbackUrl;

    @Bean
    public WebClient paystackWebClient() {
        return WebClient.builder()
                .baseUrl("https://api.paystack.co")
                .defaultHeader("Authorization", "Bearer " + secretKey)
                .defaultHeader("Content-Type", "application/json")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();
    }

    public String getSecretKey() { return secretKey; }
    public String getPublicKey() { return publicKey; }
    public String getWebhookSecret() { return webhookSecret; }
    public String getCallbackUrl() { return callbackUrl; }
}
