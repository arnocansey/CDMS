package com.cdms.service;

import com.cdms.dto.*;
import com.cdms.entity.User;
import com.cdms.entity.Church;
import com.cdms.entity.Role;
import com.cdms.exception.BadRequestException;
import com.cdms.repository.UserRepository;
import com.cdms.repository.ChurchRepository;
import com.cdms.repository.RoleRepository;
import com.cdms.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ChurchRepository churchRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       ChurchRepository churchRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.churchRepository = churchRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String accessToken = tokenProvider.generateToken(userDetails, user.getChurchId());
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        UserDto userDto = mapToUserDto(user);
        Long churchId = user.getChurchId();
        String churchName = user.getChurch() != null ? user.getChurch().getName() : null;
        return new AuthResponse(accessToken, refreshToken, 86400000L, userDto, churchId, churchName, user.getAccountStatus());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        Role memberRole = roleRepository.findByName(Role.RoleName.ROLE_MEMBER)
                .orElseThrow(() -> new BadRequestException("Default role not found"));
        
        Set<Role> roles = new HashSet<>();
        roles.add(memberRole);
        user.setRoles(roles);

        Church church = null;
        if (request.getChurchId() != null) {
            church = churchRepository.findById(request.getChurchId())
                    .orElseThrow(() -> new BadRequestException("Church not found"));
            user.setChurch(church);
        } else if (request.getChurchSlug() != null) {
            church = churchRepository.findBySlug(request.getChurchSlug())
                    .orElseThrow(() -> new BadRequestException("Church not found"));
            user.setChurch(church);
        }

        user.setAccountStatus("PENDING");

        User savedUser = userRepository.save(user);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                savedUser.getEmail(), savedUser.getPassword(),
                savedUser.isEnabled(), true, true, true,
                savedUser.getRoles().stream()
                        .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(role.getName().name()))
                        .collect(Collectors.toSet())
        );

        String accessToken = tokenProvider.generateToken(userDetails, savedUser.getChurchId());
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);

        savedUser.setRefreshToken(refreshToken);
        userRepository.save(savedUser);

        UserDto userDto = mapToUserDto(savedUser);
        Long churchIdVal = savedUser.getChurchId();
        String churchNameVal = savedUser.getChurch() != null ? savedUser.getChurch().getName() : null;
        return new AuthResponse(accessToken, refreshToken, 86400000L, userDto, churchIdVal, churchNameVal, savedUser.getAccountStatus());
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (tokenProvider.isTokenExpired(refreshToken)) {
            throw new BadRequestException("Refresh token expired");
        }

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(),
                user.isEnabled(), true, true, true,
                user.getRoles().stream()
                        .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(role.getName().name()))
                        .collect(Collectors.toSet())
        );

        String newAccessToken = tokenProvider.generateToken(userDetails);
        String newRefreshToken = tokenProvider.generateRefreshToken(userDetails);

        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        UserDto userDto = mapToUserDto(user);
        Long churchId = user.getChurchId();
        String churchName = user.getChurch() != null ? user.getChurch().getName() : null;
        return new AuthResponse(newAccessToken, newRefreshToken, 86400000L, userDto, churchId, churchName, user.getAccountStatus());
    }

    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        user.setRefreshToken(null);
        userRepository.save(user);
    }

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        return mapToUserDto(user);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found with email: " + email));

        String resetToken = java.util.UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        userRepository.save(user);

        // In production, send email with reset token
        // emailService.sendPasswordResetEmail(email, resetToken);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findAll().stream()
                .filter(u -> token.equals(u.getPasswordResetToken()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        userRepository.save(user);
    }

    private UserDto mapToUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEnabled(user.isEnabled());
        dto.setAccountStatus(user.getAccountStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setRoles(user.getRoles().stream()
                .map(role -> {
                    String name = role.getName().name();
                    return name.startsWith("ROLE_") ? name.substring(5) : name;
                })
                .collect(Collectors.toList()));
        return dto;
    }
}
