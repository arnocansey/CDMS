package com.cdms.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Resolves the authenticated principal. JWT auth stores a Spring {@link UserDetails}
 * (email as username), not the JPA {@code User} entity — so {@code @AuthenticationPrincipal User}
 * is always null.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        if (principal instanceof String email && !"anonymousUser".equals(email)) {
            return email;
        }
        return null;
    }
}
