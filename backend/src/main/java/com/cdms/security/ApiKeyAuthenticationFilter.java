package com.cdms.security;

import com.cdms.entity.ApiKey;
import com.cdms.service.ApiKeyService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ApiKeyAuthenticationFilter.class);
    private final ApiKeyService apiKeyService;

    public ApiKeyAuthenticationFilter(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String apiKey = request.getHeader("X-API-KEY");
        String clientIp = getClientIP(request);

        if (StringUtils.hasText(apiKey)) {
            try {
                ApiKey key = apiKeyService.validateApiKey(apiKey);
                
                // Convert permissions to GrantedAuthorities
                List<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_API_KEY"));
                if (StringUtils.hasText(key.getPermissions())) {
                    Arrays.stream(key.getPermissions().split(","))
                            .map(String::trim)
                            .map(String::toUpperCase)
                            .forEach(perm -> {
                                authorities.add(new SimpleGrantedAuthority("ROLE_" + perm));
                                authorities.add(new SimpleGrantedAuthority("SCOPE_" + perm));
                            });
                }

                ApiKeyAuthenticationToken authentication = new ApiKeyAuthenticationToken(
                        key.getKeyName(),
                        key.getChurchId(),
                        authorities
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                TenantContext.setChurchId(key.getChurchId());
                apiKeyService.recordUsage(apiKey);

                log.info("SECURITY_AUDIT: Successful API Key authentication. IP: {}, KeyName: {}, ChurchID: {}", 
                        clientIp, key.getKeyName(), key.getChurchId());

            } catch (Exception e) {
                String maskedKey = apiKey.length() > 6 ? apiKey.substring(0, 6) + "..." : "***";
                log.warn("SECURITY_ALERT: Suspected API Key threat or invalid attempt. IP: {}, KeyPrefix: {}, Reason: {}", 
                        clientIp, maskedKey, e.getMessage());
                
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"Invalid or revoked API Key\", \"message\": \"" + e.getMessage() + "\"}");
                response.setContentType("application/json");
                return;
            }
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
}
