package com.cdms.security;

import org.springframework.stereotype.Component;

@Component
public class TenantContext {

    private static final ThreadLocal<Long> currentChurchId = new ThreadLocal<>();

    public static void setChurchId(Long churchId) {
        currentChurchId.set(churchId);
    }

    public static Long getChurchId() {
        return currentChurchId.get();
    }

    public static void clear() {
        currentChurchId.remove();
    }
}
