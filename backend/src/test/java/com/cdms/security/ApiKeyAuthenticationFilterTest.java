package com.cdms.security;

import com.cdms.entity.ApiKey;
import com.cdms.service.ApiKeyService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApiKeyAuthenticationFilterTest {

    @Mock
    private ApiKeyService apiKeyService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private ApiKeyAuthenticationFilter filter;

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
    void doFilterInternal_WithValidApiKey_ShouldAuthenticateAndSetTenant() throws Exception {
        ApiKey apiKey = new ApiKey();
        apiKey.setApiKey("test-key-123");
        apiKey.setChurchId(5L);
        apiKey.setKeyName("Test Integration Key");
        apiKey.setPermissions("READ,WRITE");
        apiKey.setActive(true);

        when(request.getHeader("X-API-KEY")).thenReturn("test-key-123");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(apiKeyService.validateApiKey("test-key-123")).thenReturn(apiKey);

        filter.doFilter(request, response, filterChain);

        verify(apiKeyService, times(1)).recordUsage("test-key-123");
        verify(filterChain, times(1)).doFilter(request, response);
        
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo("Test Integration Key");
        assertThat(TenantContext.getChurchId()).isEqualTo(5L);
    }

    @Test
    void doFilterInternal_WithInvalidApiKey_ShouldReturnUnauthorized() throws Exception {
        when(request.getHeader("X-API-KEY")).thenReturn("invalid-key");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(apiKeyService.validateApiKey("invalid-key")).thenThrow(new RuntimeException("Invalid key"));

        StringWriter stringWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(printWriter);

        filter.doFilter(request, response, filterChain);

        verify(response, times(1)).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(filterChain, never()).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
