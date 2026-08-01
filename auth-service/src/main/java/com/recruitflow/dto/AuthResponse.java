package com.recruitflow.dto;

public record AuthResponse(
        String token,
        String email,
        String role
) {}