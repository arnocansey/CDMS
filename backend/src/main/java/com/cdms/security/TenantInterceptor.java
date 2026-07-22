package com.cdms.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TenantInterceptor implements HandlerInterceptor {

    private static final String CHURCH_ID_HEADER = "X-Church-Id";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String churchIdHeader = request.getHeader(CHURCH_ID_HEADER);
        if (churchIdHeader == null || churchIdHeader.isEmpty()) {
            return true;
        }

        Long requestedChurchId;
        try {
            requestedChurchId = Long.parseLong(churchIdHeader);
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return false;
        }

        if (isPlatformAdmin()) {
            TenantContext.setChurchId(requestedChurchId);
            return true;
        }

        Long tokenChurchId = TenantContext.getChurchId();
        if (tokenChurchId == null || !tokenChurchId.equals(requestedChurchId)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }

        return true;
    }

    private boolean isPlatformAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> "ROLE_PLATFORM_ADMIN".equals(role));
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        TenantContext.clear();
    }
}
