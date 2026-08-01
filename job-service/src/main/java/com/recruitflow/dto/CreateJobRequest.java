package com.recruitflow.dto;

public record CreateJobRequest(String title, String description, String skills,
                               String location, Integer experienceRequired, Long recruiterId) {}