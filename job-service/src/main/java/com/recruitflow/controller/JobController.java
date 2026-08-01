package com.recruitflow.controller;

import com.recruitflow.dto.CreateJobRequest;
import com.recruitflow.model.Job;
import com.recruitflow.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public ResponseEntity<Job> create(@RequestBody CreateJobRequest req) {
        return ResponseEntity.ok(jobService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> edit(@PathVariable Long id, @RequestBody CreateJobRequest req) {
        return ResponseEntity.ok(jobService.edit(id, req));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Job> close(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.close(id));
    }

    @PutMapping("/{id}/open")
    public ResponseEntity<Job> open(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.open(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Job>> search(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer experience) {
        return ResponseEntity.ok(jobService.search(skill, location, experience));
    }
}