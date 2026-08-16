package com.recruitflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long applicationId;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private Integer technicalScore;
    private Integer communicationScore;

    // TEXT, not a bounded varchar - same reasoning as Job.description: a
    // manually-typed comment is short, but no reason to risk the same
    // "value too long" failure we hit there once AI-suggested comments
    // exist too.
    @Column(columnDefinition = "TEXT")
    private String comments;

    // getters/setters
    public Long getId() { return id; }
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public Integer getTechnicalScore() { return technicalScore; }
    public void setTechnicalScore(Integer technicalScore) { this.technicalScore = technicalScore; }
    public Integer getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(Integer communicationScore) { this.communicationScore = communicationScore; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}