package com.recruitflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long candidateId;

    @Column(nullable = false)
    private Long jobId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.APPLIED;

    @Column(nullable = false)
    private LocalDateTime appliedAt = LocalDateTime.now();

    @Column(length = 2000)
    private String coverLetter;

    public enum Status {
        APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED,
        SELECTED, REJECTED, HIRED, WITHDRAWN
    }

    // getters/setters
    public Long getId() { return id; }
    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
}