package com.recruitflow.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "application-service", contextId = "applicationReadClient")
public interface ApplicationReadClient {
    @GetMapping("/api/applications/{id}")
    ApplicationResponse getById(@PathVariable("id") Long id);
}