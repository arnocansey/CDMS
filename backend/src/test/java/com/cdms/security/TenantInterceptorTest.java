package com.cdms.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantInterceptorTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @InjectMocks
    private TenantInterceptor interceptor;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    void preHandle_PlatformAdmin_CanSetChurchIdFromHeader() {
        when(request.getHeader("X-Church-Id")).thenReturn("42");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "admin",
                        "pass",
                        List.of(new SimpleGrantedAuthority("ROLE_PLATFORM_ADMIN"))));

        boolean result = interceptor.preHandle(request, response, new Object());

        assertThat(result).isTrue();
        assertThat(TenantContext.getChurchId()).isEqualTo(42L);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void preHandle_NonAdmin_MismatchedChurchId_ReturnsForbidden() {
        TenantContext.setChurchId(1L);
        when(request.getHeader("X-Church-Id")).thenReturn("2");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "user",
                        "pass",
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));

        boolean result = interceptor.preHandle(request, response, new Object());

        assertThat(result).isFalse();
        verify(response).setStatus(HttpServletResponse.SC_FORBIDDEN);
    }

    @Test
    void preHandle_NonAdmin_MatchingChurchId_Succeeds() {
        TenantContext.setChurchId(1L);
        when(request.getHeader("X-Church-Id")).thenReturn("1");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "user",
                        "pass",
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));

        boolean result = interceptor.preHandle(request, response, new Object());

        assertThat(result).isTrue();
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void preHandle_InvalidHeader_ReturnsBadRequest() {
        when(request.getHeader("X-Church-Id")).thenReturn("not-a-number");

        boolean result = interceptor.preHandle(request, response, new Object());

        assertThat(result).isFalse();
        verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }
}
