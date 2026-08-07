package com.recruitflow.service;

import com.recruitflow.dto.*;
import com.recruitflow.exception.InvalidCredentialsException;
import com.recruitflow.model.User;
import com.recruitflow.repository.UserRepository;
import com.recruitflow.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
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
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));
        if (!encoder.matches(req.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid credentials");
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
}