package com.cdms.controller;

import com.cdms.dto.RegisterRequest;
import com.cdms.entity.Church;
import com.cdms.entity.ChurchSubscription;
import com.cdms.entity.SubscriptionPlan;
import com.cdms.entity.User;
import com.cdms.entity.Role;
import com.cdms.entity.Event;
import com.cdms.entity.Announcement;
import com.cdms.entity.ChurchRegistrationRequest;
import com.cdms.repository.ChurchRegistrationRequestRepository;
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
import java.util.HashMap;
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
    private final ChurchRegistrationRequestRepository churchRegistrationRequestRepository;

    public ChurchController(TenantService tenantService,
                            ChurchRepository churchRepository,
                            UserRepository userRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder,
                            MemberRepository memberRepository,
                            EventRepository eventRepository,
                            AnnouncementRepository announcementRepository,
                            ChurchRegistrationRequestRepository churchRegistrationRequestRepository) {
        this.tenantService = tenantService;
        this.churchRepository = churchRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.memberRepository = memberRepository;
        this.eventRepository = eventRepository;
        this.announcementRepository = announcementRepository;
        this.churchRegistrationRequestRepository = churchRegistrationRequestRepository;
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

        Map<String, Object> churchMap = new HashMap<>();
        churchMap.put("id", church.getId());
        churchMap.put("name", church.getName());
        churchMap.put("slug", church.getSlug());
        churchMap.put("email", church.getEmail() != null ? church.getEmail() : "");
        churchMap.put("phone", church.getPhone() != null ? church.getPhone() : "");
        churchMap.put("address", church.getAddress() != null ? church.getAddress() : "");
        churchMap.put("city", church.getCity() != null ? church.getCity() : "");
        churchMap.put("state", church.getState() != null ? church.getState() : "");
        churchMap.put("zipCode", church.getZipCode() != null ? church.getZipCode() : "");
        churchMap.put("website", church.getWebsite() != null ? church.getWebsite() : "");
        churchMap.put("logoUrl", church.getLogoUrl() != null ? church.getLogoUrl() : "");
        churchMap.put("primaryColor", church.getPrimaryColor());
        churchMap.put("secondaryColor", church.getSecondaryColor());

        return ResponseEntity.ok(Map.of(
                "church", churchMap,
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
        String email = request.getEmail();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "A user with this email already exists"
            ));
        }

        if (churchRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "A church with this email already exists"
            ));
        }

        if (churchRegistrationRequestRepository.findByRequesterEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "A registration request for this email is already pending review"
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

        String passwordHash = "PASSWORD_HASH:" + passwordEncoder.encode(request.getPassword());

        ChurchRegistrationRequest registrationRequest = new ChurchRegistrationRequest();
        registrationRequest.setChurchName(request.getName() != null ? request.getName() : request.getFirstName() + "'s Church");
        registrationRequest.setChurchSlug(slug);
        registrationRequest.setChurchEmail(request.getEmail());
        registrationRequest.setChurchPhone(request.getPhone());
        registrationRequest.setChurchCity(request.getCity());
        registrationRequest.setChurchState(request.getState());
        registrationRequest.setRequesterName(request.getFirstName() + " " + request.getLastName());
        registrationRequest.setRequesterEmail(request.getEmail());
        registrationRequest.setRequesterMessage(passwordHash);
        registrationRequest.setStatus("PENDING");

        churchRegistrationRequestRepository.save(registrationRequest);

        return ResponseEntity.ok(Map.of(
                "message", "Registration request submitted successfully! A platform admin will review it."
        ));
    }
}
