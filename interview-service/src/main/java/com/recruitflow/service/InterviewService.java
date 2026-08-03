package com.recruitflow.service;

import com.recruitflow.client.ApplicationClient;
import com.recruitflow.client.ApplicationReadClient;
import com.recruitflow.client.ApplicationResponse;
import com.recruitflow.model.Interview;
import com.recruitflow.repository.InterviewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class InterviewService {
    private final InterviewRepository repo;
    private final ApplicationClient applicationClient;
    private final ApplicationReadClient applicationReadClient;

    public InterviewService(InterviewRepository repo,
                            ApplicationClient applicationClient,
                            ApplicationReadClient applicationReadClient) {
        this.repo = repo;
        this.applicationClient = applicationClient;
        this.applicationReadClient = applicationReadClient;
    }

    public Interview schedule(Long applicationId, LocalDateTime scheduledAt) {
        ApplicationResponse app = applicationReadClient.getById(applicationId);
        if (!"SHORTLISTED".equals(app.status())) {
            throw new IllegalStateException(
                    "Can only schedule an interview for a SHORTLISTED application, current status: " + app.status());
        }
        repo.findByApplicationId(applicationId).ifPresent(i -> {
            throw new IllegalStateException("An interview is already scheduled for this application");
        });

        Interview interview = new Interview();
        interview.setApplicationId(applicationId);
        interview.setScheduledAt(scheduledAt);
        Interview saved = repo.save(interview);

        // Update application status via Feign — if this fails, the interview record still exists;
        // log it rather than rolling back, same pattern as the notification calls in Day 3.
        try {
            applicationClient.markInterviewScheduled(applicationId);
        } catch (Exception e) {
            throw new IllegalStateException("Interview created but failed to update application status: " + e.getMessage());
        }

        return saved;
    }

    public Interview submitFeedback(Long applicationId, Integer technicalScore, Integer communicationScore, String comments) {
        Interview interview = repo.findByApplicationId(applicationId)
                .orElseThrow(() -> new IllegalStateException("No interview found for this application"));
        interview.setTechnicalScore(technicalScore);
        interview.setCommunicationScore(communicationScore);
        interview.setComments(comments);
        return repo.save(interview);
    }
}