package com.recruitflow.controller;

import com.recruitflow.dto.*;
import com.recruitflow.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.ok("Registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    // Any authenticated user can look up another user's basic (non-sensitive)
    // info by id — e.g. a recruiter viewing which candidate applied to their job.
    @GetMapping("/users/{id}")
    public ResponseEntity<UserSummary> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getUserSummary(id));
    }
}