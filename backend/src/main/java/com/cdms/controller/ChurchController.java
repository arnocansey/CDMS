package com.cdms.controller;

import com.cdms.dto.RegisterRequest;
import com.cdms.entity.Church;
import com.cdms.entity.ChurchSubscription;
import com.cdms.entity.SubscriptionPlan;
import com.cdms.entity.User;
import com.cdms.entity.Role;
import com.cdms.entity.Event;
import com.cdms.entity.Announcement;
import com.cdms.repository.ChurchRepository;
import com.cdms.repository.RoleRepository;
import com.cdms.repository.UserRepository;
import com.cdms.repository.MemberRepository;
import com.cdms.repository.EventRepository;
import com.cdms.repository.AnnouncementRepository;
import com.cdms.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/churches")
public class ChurchController {

    private final TenantService tenantService;
    private final ChurchRepository churchRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final MemberRepository memberRepository;
    private final EventRepository eventRepository;
    private final AnnouncementRepository announcementRepository;

    public ChurchController(TenantService tenantService,
                            ChurchRepository churchRepository,
                            UserRepository userRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder,
                            MemberRepository memberRepository,
                            EventRepository eventRepository,
                            AnnouncementRepository announcementRepository) {
        this.tenantService = tenantService;
        this.churchRepository = churchRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.memberRepository = memberRepository;
        this.eventRepository = eventRepository;
        this.announcementRepository = announcementRepository;
    }

    @GetMapping("/public/{slug}")
    public ResponseEntity<?> getChurchBySlug(@PathVariable String slug) {
        Church church = churchRepository.findBySlug(slug).orElse(null);
        if (church == null || !church.isEnabled()) {
            return ResponseEntity.notFound().build();
        }

        long memberCount = memberRepository.countActiveMembersByChurchId(church.getId());

        List<Event> upcomingEvents = eventRepository.findUpcomingEventsByChurchId(
                church.getId(), LocalDate.now()).stream()
                .limit(5)
                .collect(Collectors.toList());

        List<Announcement> announcements = announcementRepository.findActiveAnnouncementsByChurchId(
                church.getId(), LocalDate.now()).stream()
                .limit(5)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "church", Map.of(
                        "id", church.getId(),
                        "name", church.getName(),
                        "slug", church.getSlug(),
                        "email", church.getEmail() != null ? church.getEmail() : "",
                        "phone", church.getPhone() != null ? church.getPhone() : "",
                        "address", church.getAddress() != null ? church.getAddress() : "",
                        "city", church.getCity() != null ? church.getCity() : "",
                        "state", church.getState() != null ? church.getState() : "",
                        "zipCode", church.getZipCode() != null ? church.getZipCode() : "",
                        "website", church.getWebsite() != null ? church.getWebsite() : "",
                        "logoUrl", church.getLogoUrl() != null ? church.getLogoUrl() : "",
                        "primaryColor", church.getPrimaryColor(),
                        "secondaryColor", church.getSecondaryColor()
                ),
                "memberCount", memberCount,
                "upcomingEvents", upcomingEvents.stream().map(e -> Map.of(
                        "id", e.getId(),
                        "title", e.getTitle(),
                        "description", e.getDescription() != null ? e.getDescription() : "",
                        "eventDate", e.getEventDate().toString(),
                        "location", e.getLocation() != null ? e.getLocation() : ""
                )).collect(Collectors.toList()),
                "announcements", announcements.stream().map(a -> Map.of(
                        "id", a.getId(),
                        "title", a.getTitle(),
                        "content", a.getContent(),
                        "publishDate", a.getPublishDate() != null ? a.getPublishDate().toString() : "",
                        "createdAt", a.getCreatedAt().toString()
                )).collect(Collectors.toList())
        ));
    }

    @GetMapping("/current")
    public ResponseEntity<Church> getCurrentChurch() {
        Church church = tenantService.getCurrentChurch();
        return ResponseEntity.ok(church);
    }

    @PutMapping("/current")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Church> updateCurrentChurch(@RequestBody Church updatedChurch) {
        Church church = tenantService.getCurrentChurch();
        church.setName(updatedChurch.getName());
        church.setEmail(updatedChurch.getEmail());
        church.setPhone(updatedChurch.getPhone());
        church.setAddress(updatedChurch.getAddress());
        church.setCity(updatedChurch.getCity());
        church.setState(updatedChurch.getState());
        church.setZipCode(updatedChurch.getZipCode());
        church.setTimezone(updatedChurch.getTimezone());
        church.setLogoUrl(updatedChurch.getLogoUrl());
        Church saved = churchRepository.save(church);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/current/subscription")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<Map<String, Object>> getCurrentSubscription() {
        Church church = tenantService.getCurrentChurch();
        ChurchSubscription subscription = tenantService.getCurrentSubscription();
        SubscriptionPlan plan = tenantService.getCurrentPlan();

        return ResponseEntity.ok(Map.of(
                "church", church,
                "subscription", subscription,
                "plan", plan
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createChurch(@Valid @RequestBody RegisterRequest request) {
        Church church = new Church();
        church.setName(request.getName() != null ? request.getName() : request.getFirstName() + "'s Church");

        String email = request.getEmail();

        if (churchRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "A church with this email already exists"
            ));
        }

        String slug = request.getChurchSlug() != null ? request.getChurchSlug()
                : email.split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", "-");

        String baseSlug = slug;
        int counter = 1;
        while (churchRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        church.setSlug(slug);
        church.setEmail(request.getEmail());
        church.setPhone(request.getPhone());
        church.setCity(request.getCity());
        church.setState(request.getState());
        church.setEnabled(true);

        Church savedChurch = tenantService.createChurch(church, "Free");

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setChurchId(savedChurch.getId());
        user.setAccountStatus("APPROVED");

        Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Admin role not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);
        user.setRoles(roles);

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "church", savedChurch,
                "message", "Church registered successfully"
        ));
    }
}
