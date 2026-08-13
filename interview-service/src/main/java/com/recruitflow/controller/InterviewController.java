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
    public ResponseEntity<Interview> schedule(@RequestBody ScheduleRequest req) {
        return ResponseEntity.ok(service.schedule(req.applicationId(), req.scheduledAt()));
    }

    @PutMapping("/{applicationId}/feedback")
    public ResponseEntity<Interview> feedback(@PathVariable Long applicationId, @RequestBody FeedbackRequest req) {
        return ResponseEntity.ok(service.submitFeedback(
                applicationId, req.technicalScore(), req.communicationScore(), req.comments()));
    }

    // Used by RecruiterReviewPage to show interview details + feedback
    // before a recruiter selects/rejects a candidate.
    @GetMapping("/{applicationId}")
    public ResponseEntity<Interview> getByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(service.getByApplicationId(applicationId));
    }
}
