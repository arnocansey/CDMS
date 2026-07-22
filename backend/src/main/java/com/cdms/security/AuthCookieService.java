package com.cdms.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AuthCookieService {

    public static final String ACCESS_TOKEN_COOKIE = JwtAuthenticationFilter.ACCESS_TOKEN_COOKIE;
    public static final String REFRESH_TOKEN_COOKIE = "cdms_refresh_token";

    @Value("${jwt.expiration:86400000}")
    private long accessTokenExpirationMs;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshTokenExpirationMs;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookies;

    public void setAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(
                ACCESS_TOKEN_COOKIE, accessToken, Duration.ofMillis(accessTokenExpirationMs)).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(
                REFRESH_TOKEN_COOKIE, refreshToken, Duration.ofMillis(refreshTokenExpirationMs)).toString());
    }

    public void clearAuthCookies(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(ACCESS_TOKEN_COOKIE, "", Duration.ZERO).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(REFRESH_TOKEN_COOKIE, "", Duration.ZERO).toString());
    }

    private ResponseCookie buildCookie(String name, String value, Duration maxAge) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secureCookies)
                .path("/")
                .sameSite("Lax")
                .maxAge(maxAge)
                .build();
    }
}
