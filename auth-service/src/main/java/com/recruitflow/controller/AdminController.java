package com.recruitflow.controller;

import com.recruitflow.dto.AdminUserView;
import com.recruitflow.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Everything here is meant for ADMIN-role callers only. Role enforcement
// happens in the gateway's JwtAuthFilter (any /api/**/admin/** path requires
// an ADMIN token) - this controller assumes that's already been checked.
@RestController
@RequestMapping("/api/auth/admin")
public class AdminController {
    private final AuthService authService;

    public AdminController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserView>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PutMapping("/users/{id}/suspend")
    public ResponseEntity<AdminUserView> suspend(@PathVariable Long id) {
        return ResponseEntity.ok(authService.setUserEnabled(id, false));
    }

    @PutMapping("/users/{id}/reactivate")
    public ResponseEntity<AdminUserView> reactivate(@PathVariable Long id) {
        return ResponseEntity.ok(authService.setUserEnabled(id, true));
    }
}
