package com.cdms.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, RateLimitInfo> requestCounts = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 60;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String clientIp = getClientIP(request);
        RateLimitInfo rateLimitInfo = requestCounts.computeIfAbsent(clientIp, k -> new RateLimitInfo());

        if (rateLimitInfo.isBlocked()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
            response.setContentType("application/json");
            return;
        }

        if (rateLimitInfo.incrementAndGet() > MAX_REQUESTS_PER_MINUTE) {
            rateLimitInfo.block();
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
            response.setContentType("application/json");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class RateLimitInfo {
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile long windowStart = System.currentTimeMillis();
        private volatile boolean blocked = false;

        public int incrementAndGet() {
            long currentTime = System.currentTimeMillis();
            if (currentTime - windowStart > 60000) {
                count.set(0);
                windowStart = currentTime;
                blocked = false;
            }
            return count.incrementAndGet();
        }

        public boolean isBlocked() {
            return blocked;
        }

        public void block() {
            blocked = true;
        }
    }
}
