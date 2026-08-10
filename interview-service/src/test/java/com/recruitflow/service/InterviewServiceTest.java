package com.recruitflow.service;

import com.recruitflow.client.ApplicationClient;
import com.recruitflow.client.ApplicationReadClient;
import com.recruitflow.client.ApplicationResponse;
import com.recruitflow.model.Interview;
import com.recruitflow.repository.InterviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewServiceTest {

    @Mock
    private InterviewRepository repo;

    @Mock
    private ApplicationClient applicationClient;

    @Mock
    private ApplicationReadClient applicationReadClient;

    @InjectMocks
    private InterviewService interviewService;

    private LocalDateTime scheduledAt;

    @BeforeEach
    void setUp() {
        scheduledAt = LocalDateTime.of(2026, 8, 20, 10, 30);
    }

    // ---------------------------------------------------------
    // schedule()
    // ---------------------------------------------------------

    @Test
    void schedule_shouldCreateInterviewForShortlistedApplication() {

        Long applicationId = 1L;

        ApplicationResponse response =
                new ApplicationResponse(applicationId, 10L, 20L, "SHORTLISTED");

        when(applicationReadClient.getById(applicationId))
                .thenReturn(response);

        when(repo.findByApplicationId(applicationId))
                .thenReturn(Optional.empty());

        Interview savedInterview = new Interview();
        savedInterview.setId(100L);
        savedInterview.setApplicationId(applicationId);
        savedInterview.setScheduledAt(scheduledAt);

        when(repo.save(any(Interview.class)))
                .thenReturn(savedInterview);

        Interview result =
                interviewService.schedule(applicationId, scheduledAt);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals(applicationId, result.getApplicationId());
        assertEquals(scheduledAt, result.getScheduledAt());

        verify(repo).save(any(Interview.class));
        verify(applicationClient).markInterviewScheduled(applicationId);
    }

    @Test
    void schedule_shouldRejectNonShortlistedApplication() {

        Long applicationId = 1L;

        ApplicationResponse response =
                new ApplicationResponse(applicationId, 10L, 20L, "UNDER_REVIEW");

        when(applicationReadClient.getById(applicationId))
                .thenReturn(response);

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () -> interviewService.schedule(applicationId, scheduledAt)
                );

        assertTrue(exception.getMessage().contains("SHORTLISTED"));

        verify(repo, never()).save(any());
        verify(applicationClient, never()).markInterviewScheduled(anyLong());
    }

    @Test
    void schedule_shouldRejectIfInterviewAlreadyExists() {

        Long applicationId = 1L;

        ApplicationResponse response =
                new ApplicationResponse(applicationId, 10L, 20L, "SHORTLISTED");

        when(applicationReadClient.getById(applicationId))
                .thenReturn(response);

        Interview existingInterview = new Interview();
        existingInterview.setId(50L);
        existingInterview.setApplicationId(applicationId);

        when(repo.findByApplicationId(applicationId))
                .thenReturn(Optional.of(existingInterview));

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () -> interviewService.schedule(applicationId, scheduledAt)
                );

        assertEquals(
                "An interview is already scheduled for this application",
                exception.getMessage()
        );

        verify(repo, never()).save(any());
        verify(applicationClient, never()).markInterviewScheduled(anyLong());
    }

    @Test
    void schedule_shouldThrowIfApplicationStatusUpdateFails() {

        Long applicationId = 1L;

        ApplicationResponse response =
                new ApplicationResponse(applicationId, 10L, 20L, "SHORTLISTED");

        when(applicationReadClient.getById(applicationId))
                .thenReturn(response);

        when(repo.findByApplicationId(applicationId))
                .thenReturn(Optional.empty());

        Interview savedInterview = new Interview();
        savedInterview.setId(100L);
        savedInterview.setApplicationId(applicationId);
        savedInterview.setScheduledAt(scheduledAt);

        when(repo.save(any(Interview.class)))
                .thenReturn(savedInterview);

        doThrow(new RuntimeException("Application service unavailable"))
                .when(applicationClient)
                .markInterviewScheduled(applicationId);

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () -> interviewService.schedule(applicationId, scheduledAt)
                );

        assertTrue(
                exception.getMessage()
                        .contains("Interview created but failed to update application status")
        );

        verify(repo).save(any(Interview.class));
        verify(applicationClient).markInterviewScheduled(applicationId);
    }

    // ---------------------------------------------------------
    // submitFeedback()
    // ---------------------------------------------------------

    @Test
    void submitFeedback_shouldUpdateExistingInterview() {

        Long applicationId = 1L;

        Interview interview = new Interview();
        interview.setId(100L);
        interview.setApplicationId(applicationId);

        when(repo.findByApplicationId(applicationId))
                .thenReturn(Optional.of(interview));

        when(repo.save(any(Interview.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Interview result = interviewService.submitFeedback(
                applicationId,
                9,
                8,
                "Excellent candidate"
        );

        assertEquals(9, result.getTechnicalScore());
        assertEquals(8, result.getCommunicationScore());
        assertEquals("Excellent candidate", result.getComments());

        verify(repo).save(interview);
    }

    @Test
    void submitFeedback_shouldThrowIfInterviewDoesNotExist() {

        Long applicationId = 1L;

        when(repo.findByApplicationId(applicationId))
                .thenReturn(Optional.empty());

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () -> interviewService.submitFeedback(
                                applicationId,
                                9,
                                8,
                                "Good candidate"
                        )
                );

        assertEquals(
                "No interview found for this application",
                exception.getMessage()
        );

        verify(repo, never()).save(any());
    }
}