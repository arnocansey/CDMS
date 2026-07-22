package com.cdms.security;

import com.cdms.exception.BadRequestException;
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

    public static Long requireChurchId() {
        Long churchId = currentChurchId.get();
        if (churchId == null) {
            throw new BadRequestException("No church context set");
        }
        return churchId;
    }

    public static void clear() {
        currentChurchId.remove();
    }
}
