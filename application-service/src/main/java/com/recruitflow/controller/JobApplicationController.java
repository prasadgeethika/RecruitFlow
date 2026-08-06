package com.recruitflow.controller;

import com.recruitflow.model.JobApplication;
import com.recruitflow.service.JobApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {
    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    public record ApplyRequest(Long candidateId, Long jobId, String coverLetter) {}

    @PostMapping
    public ResponseEntity<JobApplication> apply(@RequestBody ApplyRequest req) {
        return ResponseEntity.ok(service.apply(req.candidateId(), req.jobId(), req.coverLetter()));
    }

    @PutMapping("/{id}/withdraw")
    public ResponseEntity<JobApplication> withdraw(@PathVariable Long id) {
        return ResponseEntity.ok(service.withdraw(id));
    }

    @PutMapping("/{id}/under-review")
    public ResponseEntity<JobApplication> underReview(@PathVariable Long id) {
        return ResponseEntity.ok(service.moveToUnderReview(id));
    }

    @PutMapping("/{id}/shortlist")
    public ResponseEntity<JobApplication> shortlist(@PathVariable Long id) {
        return ResponseEntity.ok(service.shortlist(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<JobApplication> reject(@PathVariable Long id) {
        return ResponseEntity.ok(service.reject(id));
    }

    @PutMapping("/{id}/interview-scheduled")
    public ResponseEntity<JobApplication> interviewScheduled(@PathVariable Long id) {
        return ResponseEntity.ok(service.markInterviewScheduled(id));
    }

    @PutMapping("/{id}/select")
    public ResponseEntity<JobApplication> select(@PathVariable Long id) {
        return ResponseEntity.ok(service.markSelected(id));
    }

    @PutMapping("/{id}/hire")
    public ResponseEntity<JobApplication> hire(@PathVariable Long id) {
        return ResponseEntity.ok(service.markHired(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<JobApplication>> getApplicationsByCandidate(@PathVariable Long candidateId) {
        return ResponseEntity.ok(service.getApplicationsByCandidate(candidateId));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplication>> getApplicationsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(service.getApplicationsByJob(jobId));
    }
}
