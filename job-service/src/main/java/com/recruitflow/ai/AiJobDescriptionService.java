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

// Uses Google's Gemini API (aistudio.google.com) instead of Anthropic's -
// Gemini has a genuine permanent free tier (no credit card, 1,500
// requests/day on Flash as of 2026), unlike Anthropic which requires a
// funded billing account even for light use.
@Service
public class AiJobDescriptionService {
    private static final Logger log = LoggerFactory.getLogger(AiJobDescriptionService.class);

    // Configurable so a model-name/version change doesn't require a
    // redeploy - just update gemini.model in application.properties.
    // Google's Gemini lineup moves fast (2.5 -> 3.5 -> 3.6 -> 3.7 within
    // 2026 alone) and old model IDs get cut off from new API keys with a
    // 404, as gemini-2.5-flash was. If this 404s again, check
    // https://ai.google.dev/gemini-api/docs/models for the current lineup.
    private final String model;

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RateLimiter rateLimiter;
    private final String apiKey;

    public AiJobDescriptionService(
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

    public GenerateDescriptionResponse generate(GenerateDescriptionRequest req) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI description generation isn't configured (missing GEMINI_API_KEY).");
        }

        if (req.title() == null || req.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job title is required.");
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

            return new GenerateDescriptionResponse(text.trim());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Job description generation failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Couldn't generate a description right now. Please write one manually or try again.");
        }
    }

    // Combines "generate a description" and "go deeper for senior roles"
    // into one prompt/button, per the original plan.
    private String buildPrompt(GenerateDescriptionRequest req) {
        int experience = req.experienceRequired() != null ? req.experienceRequired() : 0;
        boolean senior = experience >= 5;

        StringBuilder prompt = new StringBuilder();
        prompt.append("Write a professional job description for a recruitment platform. ");
        prompt.append("Role title: ").append(req.title()).append(". ");

        if (req.skills() != null && !req.skills().isBlank()) {
            prompt.append("Required skills: ").append(req.skills()).append(". ");
        }

        prompt.append("Minimum years of experience required: ").append(experience).append(". ");

        prompt.append("Structure the description with clear markdown headings: ")
                .append("'Overview', 'Responsibilities', 'Requirements'");

        if (senior) {
            prompt.append(", 'Technical Depth', and 'Architectural Guidance'. ")
                    .append("Since this is a senior-level role (")
                    .append(experience)
                    .append("+ years), the 'Technical Depth' section should reference relevant design ")
                    .append("patterns (e.g. Singleton, Factory, Observer, Strategy - whichever genuinely fit ")
                    .append("the role's tech stack) and the 'Architectural Guidance' section should cover ")
                    .append("system design expectations appropriate to seniority (e.g. scalability, ")
                    .append("service boundaries, trade-off reasoning). Do not force these in if the role's ")
                    .append("stack/skills make them irrelevant - use judgment. ");
        } else {
            prompt.append(". Keep it accessible to someone earlier in their career - ")
                    .append("avoid unnecessary architectural jargon for a role at this level. ");
        }

        prompt.append("Keep the whole thing under 350 words. ");
        prompt.append("Output only the description itself in markdown, no preamble or closing remarks.");

        return prompt.toString();
    }
}
