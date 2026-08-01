package com.recruitflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "candidates")
public class CandidateProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId; // FK to Auth Service's User, not enforced across DBs

    private String resumeUrl;
    private String skills;       // comma-separated
    private String contactNumber;
    private String location;

    // getters/setters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}