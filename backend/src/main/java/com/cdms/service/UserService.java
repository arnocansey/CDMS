package com.cdms.service;

import com.cdms.dto.UserDto;
import com.cdms.entity.User;
import com.cdms.entity.Role;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.security.TenantContext;
import com.cdms.repository.ChurchRepository;
import com.cdms.repository.UserRepository;
import com.cdms.repository.RoleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ChurchRepository churchRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, ChurchRepository churchRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.churchRepository = churchRepository;
    }

    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(Pageable pageable) {
        Long churchId = TenantContext.requireChurchId();
        return userRepository.findByChurchId(churchId, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && (user.getChurch() == null || !user.getChurch().getId().equals(churchId))) {
            throw new ResourceNotFoundException("User", id);
        }
        return mapToDto(user);
    }

    @Transactional
    public UserDto createUser(UserDto userDto) {
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setPassword(passwordEncoder.encode("defaultPassword123"));
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setEnabled(userDto.isEnabled());
        Long churchId = TenantContext.getChurchId();
        if (churchId != null) {
            user.setChurch(churchRepository.findById(churchId).orElse(null));
        }

        if (userDto.getRoles() != null && !userDto.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : userDto.getRoles()) {
                Role role = roleRepository.findByName(Role.RoleName.valueOf(toEnumName(roleName)))
                        .orElseThrow(() -> new BadRequestException("Role not found: " + roleName));
                roles.add(role);
            }
            user.setRoles(roles);
        }

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    @Transactional
    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && (user.getChurch() == null || !user.getChurch().getId().equals(churchId))) {
            throw new ResourceNotFoundException("User", id);
        }

        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setEnabled(userDto.isEnabled());

        if (userDto.getRoles() != null) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : userDto.getRoles()) {
                Role role = roleRepository.findByName(Role.RoleName.valueOf(toEnumName(roleName)))
                        .orElseThrow(() -> new BadRequestException("Role not found: " + roleName));
                roles.add(role);
            }
            user.setRoles(roles);
        }

        User updatedUser = userRepository.save(user);
        return mapToDto(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && (user.getChurch() == null || !user.getChurch().getId().equals(churchId))) {
            throw new ResourceNotFoundException("User", id);
        }
        userRepository.delete(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    private String toEnumName(String roleName) {
        if (roleName.startsWith("ROLE_")) return roleName;
        return "ROLE_" + roleName;
    }

    private String toDtoName(String enumName) {
        if (enumName.startsWith("ROLE_")) return enumName.substring(5);
        return enumName;
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEnabled(user.isEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setRoles(user.getRoles().stream()
                .map(role -> toDtoName(role.getName().name()))
                .collect(Collectors.toList()));
        return dto;
    }
}
