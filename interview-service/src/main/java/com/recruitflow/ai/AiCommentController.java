package com.recruitflow.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Not on InterviewController - this doesn't touch the Interview entity or
// Postgres at all, just returns generated text for the interviewer to
// review/edit before actually submitting feedback.
@RestController
@RequestMapping("/api/interviews")
public class AiCommentController {
    private final AiCommentService aiCommentService;

    public AiCommentController(AiCommentService aiCommentService) {
        this.aiCommentService = aiCommentService;
    }

    @PostMapping("/generate-comment")
    public ResponseEntity<GenerateCommentResponse> generate(@RequestBody GenerateCommentRequest req) {
        return ResponseEntity.ok(aiCommentService.generate(req));
    }
}
