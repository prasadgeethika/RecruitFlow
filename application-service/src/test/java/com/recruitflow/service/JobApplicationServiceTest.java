package com.recruitflow.service;

import com.recruitflow.client.NotificationClient;
import com.recruitflow.model.JobApplication;
import com.recruitflow.model.JobApplication.Status;
import com.recruitflow.repository.JobApplicationRepository;
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
class JobApplicationServiceTest {

    @Mock
    private JobApplicationRepository repo;

    @Mock
    private NotificationClient notificationClient;

    @InjectMocks
    private JobApplicationService service;

    private JobApplication appWithStatus(Status status) {
        JobApplication app = new JobApplication();
        app.setCandidateId(1L);
        app.setJobId(100L);
        app.setStatus(status);
        return app;
    }

    // save() just returns whatever was passed in, so status changes are visible on the returned object
    @BeforeEach
    void setUp() {
        lenient().when(repo.save(any(JobApplication.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    // ---------- apply() : duplicate-application guard ----------

    @Test
    void apply_succeeds_whenNoExistingApplication() {
        when(repo.findByCandidateIdAndJobId(1L, 100L)).thenReturn(Optional.empty());

        JobApplication result = service.apply(1L, 100L, "cover letter");

        assertEquals(Status.APPLIED, result.getStatus());
        verify(repo).save(any(JobApplication.class));
    }

    @Test
    void apply_throws_whenDuplicateApplicationExists() {
        when(repo.findByCandidateIdAndJobId(1L, 100L))
                .thenReturn(Optional.of(appWithStatus(Status.APPLIED)));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.apply(1L, 100L, "cover letter"));
        assertTrue(ex.getMessage().toLowerCase().contains("already applied"));
        verify(repo, never()).save(any());
    }

    // ---------- withdraw() : only from APPLIED ----------

    @Test
    void withdraw_succeeds_fromApplied() {
        JobApplication app = appWithStatus(Status.APPLIED);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        JobApplication result = service.withdraw(1L);

        assertEquals(Status.WITHDRAWN, result.getStatus());
        verify(notificationClient).createNotification(any());
    }

    @Test
    void withdraw_throws_whenNotApplied() {
        JobApplication app = appWithStatus(Status.SHORTLISTED);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        assertThrows(IllegalStateException.class, () -> service.withdraw(1L));
        verify(repo, never()).save(any());
        verifyNoInteractions(notificationClient);
    }

    // ---------- moveToUnderReview() : only from APPLIED ----------

    @Test
    void moveToUnderReview_succeeds_fromApplied() {
        JobApplication app = appWithStatus(Status.APPLIED);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        JobApplication result = service.moveToUnderReview(1L);

        assertEquals(Status.UNDER_REVIEW, result.getStatus());
    }

    @Test
    void moveToUnderReview_throws_whenNotApplied() {
        JobApplication app = appWithStatus(Status.WITHDRAWN);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        assertThrows(IllegalStateException.class, () -> service.moveToUnderReview(1L));
        verify(repo, never()).save(any());
    }

    // ---------- shortlist() : only from UNDER_REVIEW ----------

    @Test
    void shortlist_succeeds_fromUnderReview() {
        JobApplication app = appWithStatus(Status.UNDER_REVIEW);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        JobApplication result = service.shortlist(1L);

        assertEquals(Status.SHORTLISTED, result.getStatus());
        verify(notificationClient).createNotification(any());
    }

    @Test
    void shortlist_throws_whenNotUnderReview() {
        JobApplication app = appWithStatus(Status.APPLIED);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        assertThrows(IllegalStateException.class, () -> service.shortlist(1L));
        verify(repo, never()).save(any());
        verifyNoInteractions(notificationClient);
    }

    // ---------- reject() : only from UNDER_REVIEW ----------

    @Test
    void reject_succeeds_fromUnderReview() {
        JobApplication app = appWithStatus(Status.UNDER_REVIEW);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        JobApplication result = service.reject(1L);

        assertEquals(Status.REJECTED, result.getStatus());
        verify(notificationClient).createNotification(any());
    }

    @Test
    void reject_throws_whenNotUnderReview() {
        JobApplication app = appWithStatus(Status.SHORTLISTED);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        assertThrows(IllegalStateException.class, () -> service.reject(1L));
        verify(repo, never()).save(any());
        verifyNoInteractions(notificationClient);
    }

    // ---------- markInterviewScheduled() : only from SHORTLISTED ----------

    @Test
    void markInterviewScheduled_succeeds_fromShortlisted() {
        JobApplication app = appWithStatus(Status.SHORTLISTED);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        JobApplication result = service.markInterviewScheduled(1L);

        assertEquals(Status.INTERVIEW_SCHEDULED, result.getStatus());
        verify(notificationClient).createNotification(any());
    }

    @Test
    void markInterviewScheduled_throws_whenNotShortlisted() {
        JobApplication app = appWithStatus(Status.UNDER_REVIEW);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        assertThrows(IllegalStateException.class, () -> service.markInterviewScheduled(1L));
        verify(repo, never()).save(any());
    }

    // ---------- markSelected() : only from INTERVIEW_SCHEDULED ----------

    @Test
    void markSelected_succeeds_fromInterviewScheduled() {
        JobApplication app = appWithStatus(Status.INTERVIEW_SCHEDULED);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        JobApplication result = service.markSelected(1L);

        assertEquals(Status.SELECTED, result.getStatus());
    }

    @Test
    void markSelected_throws_whenNotInterviewScheduled() {
        JobApplication app = appWithStatus(Status.SHORTLISTED);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        assertThrows(IllegalStateException.class, () -> service.markSelected(1L));
        verify(repo, never()).save(any());
    }

    // ---------- markHired() : only from SELECTED ----------

    @Test
    void markHired_succeeds_fromSelected() {
        JobApplication app = appWithStatus(Status.SELECTED);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        JobApplication result = service.markHired(1L);

        assertEquals(Status.HIRED, result.getStatus());
    }

    @Test
    void markHired_throws_whenNotSelected() {
        JobApplication app = appWithStatus(Status.INTERVIEW_SCHEDULED);
        when(repo.findById(1L)).thenReturn(Optional.of(app));

        assertThrows(IllegalStateException.class, () -> service.markHired(1L));
        verify(repo, never()).save(any());
    }

    // ---------- not-found guard, shared by every method ----------

    @Test
    void anyTransition_throws_whenApplicationNotFound() {
        when(repo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () -> service.withdraw(999L));
    }

    // ---------- notification failure must not break the status change ----------

    @Test
    void shortlist_stillSucceeds_whenNotificationClientThrows() {
        JobApplication app = appWithStatus(Status.UNDER_REVIEW);
        when(repo.findById(1L)).thenReturn(Optional.of(app));
        doThrow(new RuntimeException("notification-service unreachable"))
                .when(notificationClient).createNotification(any());

        JobApplication result = service.shortlist(1L);

        assertEquals(Status.SHORTLISTED, result.getStatus());
    }
}