package com.recruitflow.service;

import com.recruitflow.client.NotificationClient;
import com.recruitflow.dto.CreateNotificationRequest;
import com.recruitflow.model.JobApplication;
import com.recruitflow.model.JobApplication.Status;
import com.recruitflow.repository.JobApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class JobApplicationService {
    private static final Logger log = LoggerFactory.getLogger(JobApplicationService.class);

    private final JobApplicationRepository repo;
    private final NotificationClient notificationClient;

    public JobApplicationService(JobApplicationRepository repo, NotificationClient notificationClient) {
        this.repo = repo;
        this.notificationClient = notificationClient;
    }

    public JobApplication apply(Long candidateId, Long jobId, String coverLetter) {
        repo.findByCandidateIdAndJobId(candidateId, jobId).ifPresent(a -> {
            throw new IllegalStateException("You have already applied to this job");
        });
        JobApplication app = new JobApplication();
        app.setCandidateId(candidateId);
        app.setJobId(jobId);
        app.setCoverLetter(coverLetter);
        app.setStatus(Status.APPLIED);
        return repo.save(app);
    }

    public JobApplication withdraw(Long applicationId) {
        JobApplication app = getOrThrow(applicationId);
        if (app.getStatus() != Status.APPLIED) {
            throw new IllegalStateException("Can only withdraw from APPLIED status, current status: " + app.getStatus());
        }
        app.setStatus(Status.WITHDRAWN);
        JobApplication saved = repo.save(app);
        notifySafely(app.getCandidateId(), "Your application has been withdrawn.");
        return saved;
    }

    public JobApplication moveToUnderReview(Long applicationId) {
        JobApplication app = getOrThrow(applicationId);
        if (app.getStatus() != Status.APPLIED) {
            throw new IllegalStateException("Can only move to UNDER_REVIEW from APPLIED, current status: " + app.getStatus());
        }
        app.setStatus(Status.UNDER_REVIEW);
        return repo.save(app);
    }

    public JobApplication shortlist(Long applicationId) {
        JobApplication app = getOrThrow(applicationId);
        if (app.getStatus() != Status.UNDER_REVIEW) {
            throw new IllegalStateException("Can only shortlist from UNDER_REVIEW, current status: " + app.getStatus());
        }
        app.setStatus(Status.SHORTLISTED);
        JobApplication saved = repo.save(app);
        notifySafely(app.getCandidateId(), "You've been shortlisted for a job!");
        return saved;
    }

    public JobApplication reject(Long applicationId) {
        JobApplication app = getOrThrow(applicationId);
        if (app.getStatus() != Status.UNDER_REVIEW) {
            throw new IllegalStateException("Can only reject from UNDER_REVIEW, current status: " + app.getStatus());
        }
        app.setStatus(Status.REJECTED);
        JobApplication saved = repo.save(app);
        notifySafely(app.getCandidateId(), "Your application was not selected to move forward.");
        return saved;
    }

    public JobApplication markInterviewScheduled(Long applicationId) {
        JobApplication app = getOrThrow(applicationId);
        if (app.getStatus() != Status.SHORTLISTED) {
            throw new IllegalStateException("Can only schedule interview from SHORTLISTED, current status: " + app.getStatus());
        }
        app.setStatus(Status.INTERVIEW_SCHEDULED);
        return repo.save(app);
    }

    public JobApplication markSelected(Long applicationId) {
        JobApplication app = getOrThrow(applicationId);
        if (app.getStatus() != Status.INTERVIEW_SCHEDULED) {
            throw new IllegalStateException("Can only select from INTERVIEW_SCHEDULED, current status: " + app.getStatus());
        }
        app.setStatus(Status.SELECTED);
        return repo.save(app);
    }

    public JobApplication markHired(Long applicationId) {
        JobApplication app = getOrThrow(applicationId);
        if (app.getStatus() != Status.SELECTED) {
            throw new IllegalStateException("Can only mark HIRED from SELECTED, current status: " + app.getStatus());
        }
        app.setStatus(Status.HIRED);
        return repo.save(app);
    }

    private JobApplication getOrThrow(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalStateException("Application not found"));
    }

    // Notification failure must never roll back the status change (per the plan)
    private void notifySafely(Long userId, String message) {
        try {
            notificationClient.createNotification(new CreateNotificationRequest(userId, message));
        } catch (Exception e) {
            log.warn("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }

    public JobApplication getById(Long id) {
        return getOrThrow(id);
    }
}