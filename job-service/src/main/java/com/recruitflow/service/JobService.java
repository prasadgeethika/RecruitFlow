package com.recruitflow.service;

import com.recruitflow.client.AuthClient;
import com.recruitflow.client.NotificationClient;
import com.recruitflow.dto.CreateJobRequest;
import com.recruitflow.dto.CreateNotificationRequest;
import com.recruitflow.model.Job;
import com.recruitflow.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class JobService {
    private static final Logger log = LoggerFactory.getLogger(JobService.class);

    private final JobRepository jobRepository;
    private final NotificationClient notificationClient;
    private final AuthClient authClient;

    public JobService(JobRepository jobRepository, NotificationClient notificationClient, AuthClient authClient) {
        this.jobRepository = jobRepository;
        this.notificationClient = notificationClient;
        this.authClient = authClient;
    }

    public Job create(CreateJobRequest req) {
        Job job = new Job();
        job.setTitle(req.title());
        job.setDescription(req.description());
        job.setSkills(req.skills());
        job.setLocation(req.location());
        job.setExperienceRequired(req.experienceRequired());
        job.setRecruiterId(req.recruiterId());
        job.setStatus(Job.Status.DRAFT);
        return jobRepository.save(job);
    }

    public Job edit(Long id, CreateJobRequest req) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Job not found"));

        if (job.getStatus() != Job.Status.DRAFT) {
            throw new IllegalStateException(
                    "Only draft jobs can be edited. Close the job and create a new one instead."
            );
        }

        job.setTitle(req.title());
        job.setDescription(req.description());
        job.setSkills(req.skills());
        job.setLocation(req.location());
        job.setExperienceRequired(req.experienceRequired());
        return jobRepository.save(job);
    }

    public Job close(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Job not found"));
        job.setStatus(Job.Status.CLOSED);
        return jobRepository.save(job);
    }

    public Job open(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Job not found"));
        job.setStatus(Job.Status.OPEN);
        return jobRepository.save(job);
    }

    // Only DRAFT jobs can be deleted - once a job has been OPEN, candidates
    // may have applied to it, and deleting it out from under an application
    // would orphan that application's job reference. Recruiters can still
    // close an OPEN/past job, just not delete it.
    public void deleteDraft(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Job not found"));

        if (job.getStatus() != Job.Status.DRAFT) {
            throw new IllegalStateException(
                    "Only draft jobs can be deleted. Close the job instead if it's already published."
            );
        }

        jobRepository.delete(job);
    }

    // Fuzzy typo-tolerant search via PostgreSQL pg_trgm - see
    // JobRepository.search() and PgTrgmInitializer.
    public List<Job> search(String skill, String location, Integer experience) {
        return jobRepository.search(skill, location, experience);
    }

    public List<Job> getJobsByRecruiter(Long recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId);
    }

    // Needed so application-service can look up which recruiter owns a job,
    // to notify them when a candidate applies.
    public Job getById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Job not found"));
    }

    // Admin-only: every job regardless of status or recruiter. /search only
    // ever returns OPEN jobs, which hides DRAFT/CLOSED postings admins need
    // to moderate.
    public List<Job> getAllForAdmin() {
        return jobRepository.findAll();
    }

    // Admin-only: same state transition as close(), but distinguished so we
    // only fire the "force-closed" admin notification here, not on every
    // ordinary recruiter-initiated close.
    public Job forceCloseByAdmin(Long id) {
        Job job = close(id);
        notifyAdminsSafely("Job force-closed: \"" + job.getTitle() + "\"");
        return job;
    }

    // Notification failure must never block the status change itself.
    private void notifyAdminsSafely(String message) {
        List<Long> adminIds;
        try {
            adminIds = authClient.getAdminIds();
        } catch (Exception e) {
            log.warn("Failed to fetch admin ids: {}", e.getMessage());
            return;
        }

        for (Long adminId : adminIds) {
            try {
                notificationClient.createNotification(new CreateNotificationRequest(adminId, message));
            } catch (Exception e) {
                log.warn("Failed to notify admin {}: {}", adminId, e.getMessage());
            }
        }
    }
}
