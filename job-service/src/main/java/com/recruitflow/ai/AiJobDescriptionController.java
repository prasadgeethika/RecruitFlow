package com.recruitflow.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Deliberately not on JobController - this doesn't touch the Job entity or
// Postgres at all. It just returns generated text for the recruiter to
// review/edit; nothing is saved until they submit the normal Create Job form.
@RestController
@RequestMapping("/api/jobs")
public class AiJobDescriptionController {
    private final AiJobDescriptionService aiJobDescriptionService;

    public AiJobDescriptionController(AiJobDescriptionService aiJobDescriptionService) {
        this.aiJobDescriptionService = aiJobDescriptionService;
    }

    @PostMapping("/generate-description")
    public ResponseEntity<GenerateDescriptionResponse> generate(@RequestBody GenerateDescriptionRequest req) {
        return ResponseEntity.ok(aiJobDescriptionService.generate(req));
    }
}
