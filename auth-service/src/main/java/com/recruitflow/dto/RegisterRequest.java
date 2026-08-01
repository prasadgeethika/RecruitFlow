package com.recruitflow.dto;

import com.recruitflow.model.User;

public record RegisterRequest(
        String email,
        String password,
        User.Role role
) {}

