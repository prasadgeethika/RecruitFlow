package com.recruitflow.controller;

import com.recruitflow.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Service-to-service only (called via Feign, e.g. by job-service to know who
// to notify on a force-close). Not meant to be reachable through the
// gateway's public routes - deliberately kept outside the /admin/ path so it
// isn't confused with the admin-only, human-facing endpoints in
// AdminController.
@RestController
@RequestMapping("/api/auth/internal")
public class InternalController {
    private final AuthService authService;

    public InternalController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/admin-ids")
    public ResponseEntity<List<Long>> getAdminIds() {
        return ResponseEntity.ok(authService.getAdminIds());
    }
}
