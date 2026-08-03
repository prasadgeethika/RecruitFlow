package com.recruitflow.controller;

import com.recruitflow.model.Interview;
import com.recruitflow.service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {
    private final InterviewService service;

    public InterviewController(InterviewService service) {
        this.service = service;
    }

    public record ScheduleRequest(Long applicationId, LocalDateTime scheduledAt) {}
    public record FeedbackRequest(Integer technicalScore, Integer communicationScore, String comments) {}

    @PostMapping("/schedule")
    public ResponseEntity<?> schedule(@RequestBody ScheduleRequest req) {
        try {
            return ResponseEntity.ok(service.schedule(req.applicationId(), req.scheduledAt()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{applicationId}/feedback")
    public ResponseEntity<?> feedback(@PathVariable Long applicationId, @RequestBody FeedbackRequest req) {
        try {
            return ResponseEntity.ok(service.submitFeedback(
                    applicationId, req.technicalScore(), req.communicationScore(), req.comments()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}