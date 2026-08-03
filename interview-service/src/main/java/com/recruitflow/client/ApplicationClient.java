package com.recruitflow.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "application-service")
public interface ApplicationClient {
    @PutMapping("/api/applications/{id}/interview-scheduled")
    Object markInterviewScheduled(@PathVariable("id") Long applicationId);
}