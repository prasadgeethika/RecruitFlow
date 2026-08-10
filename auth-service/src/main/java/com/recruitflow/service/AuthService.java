package com.recruitflow.service;

import com.recruitflow.client.NotificationClient;
import com.recruitflow.dto.*;
import com.recruitflow.exception.InvalidCredentialsException;
import com.recruitflow.model.User;
import com.recruitflow.repository.UserRepository;
import com.recruitflow.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final NotificationClient notificationClient;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil, NotificationClient notificationClient) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.notificationClient = notificationClient;
    }

    public void register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalStateException("Email already registered");
        }
        User user = new User();
        user.setEmail(req.email());
        user.setPasswordHash(encoder.encode(req.password()));
        user.setRole(req.role());
        userRepository.save(user);

        if (user.getRole() == User.Role.RECRUITER) {
            notifyAdminsSafely("New recruiter registered: " + user.getEmail());
        } else if (user.getRole() == User.Role.CANDIDATE) {
            notifyAdminsSafely("New candidate registered: " + user.getEmail());
        }
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));
        if (!encoder.matches(req.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }
        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("This account has been suspended. Contact an administrator.");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    // Powers cross-service display, e.g. a recruiter seeing which candidate applied.
    public UserSummary getUserSummary(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return new UserSummary(user.getId(), user.getEmail(), user.getRole().name());
    }

    // ---- Admin-only operations ----

    public List<AdminUserView> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new AdminUserView(u.getId(), u.getEmail(), u.getRole().name(), u.isEnabled()))
                .toList();
    }

    public AdminUserView setUserEnabled(Long id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        user.setEnabled(enabled);
        userRepository.save(user);

        if (!enabled) {
            notifyAdminsSafely("User suspended: " + user.getEmail());
        }

        return new AdminUserView(user.getId(), user.getEmail(), user.getRole().name(), user.isEnabled());
    }

    // Used by other services (e.g. job-service, on a force-close) to know
    // who to notify, without exposing full user records cross-service.
    public List<Long> getAdminIds() {
        return userRepository.findByRole(User.Role.ADMIN).stream()
                .map(User::getId)
                .toList();
    }

    // Notification failure must never block registration/suspension itself.
    private void notifyAdminsSafely(String message) {
        for (Long adminId : getAdminIds()) {
            try {
                notificationClient.createNotification(new CreateNotificationRequest(adminId, message));
            } catch (Exception e) {
                log.warn("Failed to notify admin {}: {}", adminId, e.getMessage());
            }
        }
    }
}
