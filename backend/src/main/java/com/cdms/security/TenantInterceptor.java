package com.cdms.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TenantInterceptor implements HandlerInterceptor {

    private static final String CHURCH_ID_HEADER = "X-Church-Id";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String churchIdHeader = request.getHeader(CHURCH_ID_HEADER);
        if (churchIdHeader != null && !churchIdHeader.isEmpty()) {
            try {
                Long churchId = Long.parseLong(churchIdHeader);
                TenantContext.setChurchId(churchId);
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return false;
            }
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        TenantContext.clear();
    }
}
