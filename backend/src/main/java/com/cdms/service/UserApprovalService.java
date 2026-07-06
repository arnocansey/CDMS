package com.cdms.service;

import com.cdms.dto.UserDto;
import com.cdms.entity.Church;
import com.cdms.entity.ChurchRegistrationRequest;
import com.cdms.entity.ChurchSubscription;
import com.cdms.entity.Role;
import com.cdms.entity.SubscriptionPlan;
import com.cdms.entity.User;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.ChurchRepository;
import com.cdms.repository.ChurchSubscriptionRepository;
import com.cdms.repository.ChurchRegistrationRequestRepository;
import com.cdms.repository.RoleRepository;
import com.cdms.repository.SubscriptionPlanRepository;
import com.cdms.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserApprovalService {

    private final UserRepository userRepository;
    private final ChurchRepository churchRepository;
    private final ChurchSubscriptionRepository churchSubscriptionRepository;
    private final ChurchRegistrationRequestRepository churchRegistrationRequestRepository;
    private final RoleRepository roleRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public UserApprovalService(UserRepository userRepository,
                               ChurchRepository churchRepository,
                               ChurchSubscriptionRepository churchSubscriptionRepository,
                               ChurchRegistrationRequestRepository churchRegistrationRequestRepository,
                               RoleRepository roleRepository,
                               SubscriptionPlanRepository subscriptionPlanRepository,
                               PasswordEncoder passwordEncoder,
                               NotificationService notificationService) {
        this.userRepository = userRepository;
        this.churchRepository = churchRepository;
        this.churchSubscriptionRepository = churchSubscriptionRepository;
        this.churchRegistrationRequestRepository = churchRegistrationRequestRepository;
        this.roleRepository = roleRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    public List<UserDto> getPendingUsers(Long churchId) {
        return userRepository.findAll().stream()
                .filter(u -> "PENDING".equals(u.getAccountStatus()))
                .filter(u -> churchId.equals(u.getChurchId()))
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    public UserDto approveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setAccountStatus("APPROVED");
        User savedUser = userRepository.save(user);

        if (savedUser.getChurchId() != null) {
            notificationService.createNotification(
                    savedUser.getId(),
                    "Account Approved",
                    "Your account has been approved. You now have full access to the system.",
                    "ACCOUNT_APPROVED"
            );
        }

        return mapToUserDto(savedUser);
    }

    public UserDto rejectUser(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setAccountStatus("REJECTED");
        User savedUser = userRepository.save(user);

        String message = "Your account registration has been rejected.";
        if (reason != null && !reason.isEmpty()) {
            message += " Reason: " + reason;
        }

        notificationService.createNotification(
                savedUser.getId(),
                "Account Rejected",
                message,
                "ACCOUNT_REJECTED"
        );

        return mapToUserDto(savedUser);
    }

    public List<ChurchRegistrationRequest> getPendingChurchRequests() {
        return churchRegistrationRequestRepository.findByStatus("PENDING");
    }

    public Church approveChurchRequest(Long requestId) {
        ChurchRegistrationRequest request = churchRegistrationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ChurchRegistrationRequest", requestId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new BadRequestException("Request has already been reviewed");
        }

        Church church = new Church();
        church.setName(request.getChurchName());
        church.setSlug(request.getChurchSlug());
        church.setEmail(request.getChurchEmail());
        church.setPhone(request.getChurchPhone());
        church.setCity(request.getChurchCity());
        church.setState(request.getChurchState());
        Church savedChurch = churchRepository.save(church);

        SubscriptionPlan freePlan = subscriptionPlanRepository.findByName("FREE")
                .orElse(null);
        if (freePlan == null) {
            freePlan = subscriptionPlanRepository.findAll().stream()
                    .findFirst()
                    .orElse(null);
        }
        if (freePlan != null) {
            ChurchSubscription subscription = new ChurchSubscription(savedChurch.getId(), freePlan.getId(), "ACTIVE");
            churchSubscriptionRepository.save(subscription);
        }

        String passwordHash;
        String requesterMessage = request.getRequesterMessage();
        if (requesterMessage != null && requesterMessage.startsWith("PASSWORD_HASH:")) {
            passwordHash = requesterMessage.substring("PASSWORD_HASH:".length());
        } else {
            String tempPassword = UUID.randomUUID().toString().substring(0, 12);
            passwordHash = passwordEncoder.encode(tempPassword);
        }
        User adminUser = new User();
        adminUser.setEmail(request.getRequesterEmail());
        adminUser.setPassword(passwordHash);
        adminUser.setFirstName(request.getRequesterName().contains(" ")
                ? request.getRequesterName().substring(0, request.getRequesterName().indexOf(' '))
                : request.getRequesterName());
        adminUser.setLastName(request.getRequesterName().contains(" ")
                ? request.getRequesterName().substring(request.getRequesterName().indexOf(' ') + 1)
                : "");
        adminUser.setChurch(savedChurch);
        adminUser.setAccountStatus("APPROVED");

        Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                .orElseThrow(() -> new BadRequestException("ADMIN role not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);
        adminUser.setRoles(roles);
        userRepository.save(adminUser);

        request.setStatus("APPROVED");
        request.setReviewedAt(java.time.LocalDateTime.now());
        churchRegistrationRequestRepository.save(request);

        return savedChurch;
    }

    public void rejectChurchRequest(Long requestId, String reason) {
        ChurchRegistrationRequest request = churchRegistrationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ChurchRegistrationRequest", requestId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new BadRequestException("Request has already been reviewed");
        }

        request.setStatus("REJECTED");
        request.setReviewedAt(java.time.LocalDateTime.now());
        churchRegistrationRequestRepository.save(request);

        notificationService.createNotification(
                userRepository.findByEmail(request.getRequesterEmail())
                        .map(User::getId)
                        .orElse(0L),
                "Church Registration Rejected",
                "Your church registration request has been rejected." +
                        (reason != null && !reason.isEmpty() ? " Reason: " + reason : ""),
                "CHURCH_REGISTRATION_REJECTED"
        );
    }

    public List<Church> searchChurches(String query) {
        if (query == null || query.trim().isEmpty()) {
            return churchRepository.findAll();
        }
        String lowerQuery = query.toLowerCase();
        return churchRepository.findAll().stream()
                .filter(c -> c.getName().toLowerCase().contains(lowerQuery)
                        || c.getSlug().toLowerCase().contains(lowerQuery))
                .collect(Collectors.toList());
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
                .map(role -> role.getName().name())
                .collect(Collectors.toList()));
        return dto;
    }
}
