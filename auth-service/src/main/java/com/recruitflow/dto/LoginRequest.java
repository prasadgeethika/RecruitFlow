package com.recruitflow.dto;

public record LoginRequest(
        String email,
        String password
) {}