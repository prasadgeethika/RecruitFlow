package com.recruitflow.service;

import com.recruitflow.dto.AuthResponse;
import com.recruitflow.dto.LoginRequest;
import com.recruitflow.dto.RegisterRequest;
import com.recruitflow.dto.UserSummary;
import com.recruitflow.exception.InvalidCredentialsException;
import com.recruitflow.model.User;
import com.recruitflow.repository.UserRepository;
import com.recruitflow.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User candidate;

    @BeforeEach
    void setUp() {
        candidate = new User();
        candidate.setId(1L);
        candidate.setEmail("candidate@test.com");
        candidate.setPasswordHash(
                "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
        );
        candidate.setRole(User.Role.CANDIDATE);
    }

    // ---------------------------------------------------------
    // REGISTER
    // ---------------------------------------------------------

    @Test
    void register_shouldCreateUserSuccessfully() {

        RegisterRequest request = new RegisterRequest(
                "candidate@test.com",
                "password123",
                User.Role.CANDIDATE
        );

        when(userRepository.existsByEmail(request.email()))
                .thenReturn(false);

        authService.register(request);

        verify(userRepository).existsByEmail("candidate@test.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_shouldRejectDuplicateEmail() {

        RegisterRequest request = new RegisterRequest(
                "candidate@test.com",
                "password123",
                User.Role.CANDIDATE
        );

        when(userRepository.existsByEmail(request.email()))
                .thenReturn(true);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> authService.register(request)
        );

        assertEquals(
                "Email already registered",
                exception.getMessage()
        );

        verify(userRepository).existsByEmail("candidate@test.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_shouldSavePasswordAsHashedValue() {

        RegisterRequest request = new RegisterRequest(
                "candidate@test.com",
                "password123",
                User.Role.CANDIDATE
        );

        when(userRepository.existsByEmail(request.email()))
                .thenReturn(false);

        authService.register(request);

        verify(userRepository).save(argThat(user ->
                user.getPasswordHash() != null
                        && !user.getPasswordHash().equals("password123")
                        && user.getPasswordHash().startsWith("$2")
        ));
    }

    @Test
    void register_shouldSaveCorrectEmailAndRole() {

        RegisterRequest request = new RegisterRequest(
                "recruiter@test.com",
                "password123",
                User.Role.RECRUITER
        );

        when(userRepository.existsByEmail(request.email()))
                .thenReturn(false);

        authService.register(request);

        verify(userRepository).save(argThat(user ->
                user.getEmail().equals("recruiter@test.com")
                        && user.getRole() == User.Role.RECRUITER
        ));
    }

    // ---------------------------------------------------------
    // LOGIN
    // ---------------------------------------------------------

    @Test
    void login_shouldReturnTokenForValidCredentials() {

        // Generate a real BCrypt hash for the password used in the test.
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

        candidate.setPasswordHash(
                encoder.encode("password123")
        );

        LoginRequest request = new LoginRequest(
                "candidate@test.com",
                "password123"
        );

        when(userRepository.findByEmail(request.email()))
                .thenReturn(Optional.of(candidate));

        when(jwtUtil.generateToken(
                candidate.getId(),
                candidate.getEmail(),
                candidate.getRole().name()
        )).thenReturn("test-jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("test-jwt-token", response.token());
        assertEquals("candidate@test.com", response.email());
        assertEquals("CANDIDATE", response.role());

        verify(userRepository).findByEmail("candidate@test.com");

        verify(jwtUtil).generateToken(
                1L,
                "candidate@test.com",
                "CANDIDATE"
        );
    }

    @Test
    void login_shouldRejectUnknownEmail() {

        LoginRequest request = new LoginRequest(
                "unknown@test.com",
                "password123"
        );

        when(userRepository.findByEmail(request.email()))
                .thenReturn(Optional.empty());

        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(request)
        );

        assertEquals(
                "Invalid credentials",
                exception.getMessage()
        );

        verify(jwtUtil, never()).generateToken(
                anyLong(),
                anyString(),
                anyString()
        );
    }

    @Test
    void login_shouldRejectIncorrectPassword() {

        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

        candidate.setPasswordHash(
                encoder.encode("correctPassword")
        );

        LoginRequest request = new LoginRequest(
                "candidate@test.com",
                "wrongPassword"
        );

        when(userRepository.findByEmail(request.email()))
                .thenReturn(Optional.of(candidate));

        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(request)
        );

        assertEquals(
                "Invalid credentials",
                exception.getMessage()
        );

        verify(jwtUtil, never()).generateToken(
                anyLong(),
                anyString(),
                anyString()
        );
    }

    // ---------------------------------------------------------
    // GET USER SUMMARY
    // ---------------------------------------------------------

    @Test
    void getUserSummary_shouldReturnUserInformation() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(candidate));

        UserSummary summary = authService.getUserSummary(1L);

        assertNotNull(summary);
        assertEquals(1L, summary.id());
        assertEquals("candidate@test.com", summary.email());
        assertEquals("CANDIDATE", summary.role());

        verify(userRepository).findById(1L);
    }

    @Test
    void getUserSummary_shouldRejectMissingUser() {

        when(userRepository.findById(99L))
                .thenReturn(Optional.empty());

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> authService.getUserSummary(99L)
        );

        assertEquals(
                "User not found",
                exception.getMessage()
        );

        verify(userRepository).findById(99L);
    }
}