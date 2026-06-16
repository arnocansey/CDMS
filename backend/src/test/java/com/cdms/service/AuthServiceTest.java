package com.cdms.service;

import com.cdms.dto.AuthResponse;
import com.cdms.dto.LoginRequest;
import com.cdms.dto.RegisterRequest;
import com.cdms.entity.User;
import com.cdms.entity.Role;
import com.cdms.exception.BadRequestException;
import com.cdms.repository.UserRepository;
import com.cdms.repository.RoleRepository;
import com.cdms.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User user;
    private LoginRequest loginRequest;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setEnabled(true);
        user.setRoles(new HashSet<>());

        loginRequest = new LoginRequest("test@example.com", "password123");
        registerRequest = new RegisterRequest("Test", "User", "test@example.com", "password123");
    }

    @Test
    void login_Success() {
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(mock(UserDetails.class));
        when(tokenProvider.generateToken(any(UserDetails.class), any())).thenReturn("accessToken");
        when(tokenProvider.generateRefreshToken(any(UserDetails.class))).thenReturn("refreshToken");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        AuthResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("accessToken");
        assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
    }

    @Test
    void register_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        Role memberRole = new Role(Role.RoleName.ROLE_MEMBER);
        when(roleRepository.findByName(Role.RoleName.ROLE_MEMBER)).thenReturn(Optional.of(memberRole));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(tokenProvider.generateToken(any(UserDetails.class), any())).thenReturn("accessToken");
        when(tokenProvider.generateRefreshToken(any(UserDetails.class))).thenReturn("refreshToken");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("accessToken");
    }

    @Test
    void register_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Email already exists");
    }

    @Test
    void logout_Success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        authService.logout("test@example.com");

        verify(userRepository, times(1)).save(any(User.class));
    }
}
