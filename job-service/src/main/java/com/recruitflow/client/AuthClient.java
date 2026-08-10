package com.recruitflow.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "auth-service")
public interface AuthClient {
    // Service-to-service only - see InternalController in auth-service.
    @GetMapping("/api/auth/internal/admin-ids")
    List<Long> getAdminIds();
}
