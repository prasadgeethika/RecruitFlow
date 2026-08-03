package com.recruitflow.controller;

import com.recruitflow.model.JobApplication;
import com.recruitflow.service.JobApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {
    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    public record ApplyRequest(Long candidateId, Long jobId, String coverLetter) {}

    @PostMapping
    public ResponseEntity<?> apply(@RequestBody ApplyRequest req) {
        try {
            return ResponseEntity.ok(service.apply(req.candidateId(), req.jobId(), req.coverLetter()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable Long id) {
        return guarded(() -> service.withdraw(id));
    }

    @PutMapping("/{id}/under-review")
    public ResponseEntity<?> underReview(@PathVariable Long id) {
        return guarded(() -> service.moveToUnderReview(id));
    }

    @PutMapping("/{id}/shortlist")
    public ResponseEntity<?> shortlist(@PathVariable Long id) {
        return guarded(() -> service.shortlist(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        return guarded(() -> service.reject(id));
    }

    @PutMapping("/{id}/interview-scheduled")
    public ResponseEntity<?> interviewScheduled(@PathVariable Long id) {
        return guarded(() -> service.markInterviewScheduled(id));
    }

    @PutMapping("/{id}/select")
    public ResponseEntity<?> select(@PathVariable Long id) {
        return guarded(() -> service.markSelected(id));
    }

    @PutMapping("/{id}/hire")
    public ResponseEntity<?> hire(@PathVariable Long id) {
        return guarded(() -> service.markHired(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private ResponseEntity<?> guarded(java.util.function.Supplier<JobApplication> action) {
        try {
            return ResponseEntity.ok(action.get());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}