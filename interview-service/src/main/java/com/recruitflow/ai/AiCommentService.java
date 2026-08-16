package com.recruitflow.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

// Same Gemini integration pattern as job-service's AiJobDescriptionService.
// Deliberately does NOT try to fabricate specific claims about what the
// candidate said or did in the interview - it only has the two numeric
// scores to work with, so the prompt is constrained to stay at that level
// of generality. This is a draft for the interviewer to personalize and
// review, never auto-submitted.
@Service
public class AiCommentService {
    private static final Logger log = LoggerFactory.getLogger(AiCommentService.class);

    private final String model;
    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RateLimiter rateLimiter;
    private final String apiKey;

    public AiCommentService(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-3.6-flash}") String model,
            RateLimiter rateLimiter
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.rateLimiter = rateLimiter;
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public GenerateCommentResponse generate(GenerateCommentRequest req) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI comment suggestions aren't configured (missing GEMINI_API_KEY).");
        }

        if (req.technicalScore() == null || req.communicationScore() == null
                || req.technicalScore() < 1 || req.technicalScore() > 10
                || req.communicationScore() < 1 || req.communicationScore() > 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Enter both scores (1-10) before generating a suggested comment.");
        }

        if (!rateLimiter.tryAcquire()) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many AI requests right now - please wait a minute and try again.");
        }

        String prompt = buildPrompt(req);

        try {
            String responseBody = restClient.post()
                    .uri("/v1beta/models/" + model + ":generateContent")
                    .header("x-goog-api-key", apiKey)
                    .header("content-type", "application/json")
                    .body(Map.of(
                            "contents", List.of(Map.of(
                                    "parts", List.of(Map.of("text", prompt))
                            ))
                    ))
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseBody);
            String text = root
                    .path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text").asText("");

            if (text.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI service returned an empty response.");
            }

            return new GenerateCommentResponse(text.trim());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Comment generation failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Couldn't generate a suggestion right now. Please write one manually or try again.");
        }
    }

    private String buildPrompt(GenerateCommentRequest req) {
        return "Write a short, professional interview feedback comment (2-3 sentences) for a hiring "
                + "recruiter to read. The only information you have is two numeric scores out of 10: "
                + "Technical ability: " + req.technicalScore() + "/10. "
                + "Communication: " + req.communicationScore() + "/10. "
                + "Do NOT invent specific claims about what the candidate said, did, or discussed - you "
                + "were not present at the interview and only know these two numbers. Instead, write in "
                + "general, honest terms appropriate to that score level (e.g. a high score reads as "
                + "strong performance in that area; a low score reads as an area needing improvement; a "
                + "middling score reads as solid but not exceptional). If technical and communication "
                + "scores differ notably, reflect that contrast. Keep the tone constructive and "
                + "professional either way. Output only the comment itself, no preamble, no labels, no "
                + "quotation marks.";
    }
}
