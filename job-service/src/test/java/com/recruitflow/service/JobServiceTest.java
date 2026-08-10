package com.recruitflow.service;

import com.recruitflow.dto.CreateJobRequest;
import com.recruitflow.model.Job;
import com.recruitflow.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobService jobService;

    private CreateJobRequest request() {
        return new CreateJobRequest(
                "Java Developer",
                "Backend Java developer",
                "Java, Spring Boot, PostgreSQL",
                "Hyderabad",
                2,
                10L
        );
    }

    @Test
    void create_shouldCreateDraftJob() {

        CreateJobRequest request = request();

        Job savedJob = new Job();
        savedJob.setId(1L);
        savedJob.setStatus(Job.Status.DRAFT);

        when(jobRepository.save(any(Job.class)))
                .thenReturn(savedJob);

        Job result = jobService.create(request);

        assertNotNull(result);
        assertEquals(Job.Status.DRAFT, result.getStatus());

        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void edit_shouldUpdateDraftJob() {

        Job existingJob = new Job();
        existingJob.setId(1L);
        existingJob.setStatus(Job.Status.DRAFT);

        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(existingJob));

        when(jobRepository.save(existingJob))
                .thenReturn(existingJob);

        Job result = jobService.edit(1L, request());

        assertEquals("Java Developer", result.getTitle());
        assertEquals(Job.Status.DRAFT, result.getStatus());

        verify(jobRepository).save(existingJob);
    }

    @Test
    void edit_shouldRejectOpenJob() {

        Job existingJob = new Job();
        existingJob.setId(1L);
        existingJob.setStatus(Job.Status.OPEN);

        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(existingJob));

        assertThrows(
                IllegalStateException.class,
                () -> jobService.edit(1L, request())
        );

        verify(jobRepository, never()).save(any(Job.class));
    }

    @Test
    void edit_shouldThrowException_whenJobDoesNotExist() {

        when(jobRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalStateException.class,
                () -> jobService.edit(999L, request())
        );
    }

    @Test
    void open_shouldChangeStatusToOpen() {

        Job job = new Job();
        job.setId(1L);
        job.setStatus(Job.Status.DRAFT);

        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(job));

        when(jobRepository.save(job))
                .thenReturn(job);

        Job result = jobService.open(1L);

        assertEquals(Job.Status.OPEN, result.getStatus());

        verify(jobRepository).save(job);
    }

    @Test
    void close_shouldChangeStatusToClosed() {

        Job job = new Job();
        job.setId(1L);
        job.setStatus(Job.Status.OPEN);

        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(job));

        when(jobRepository.save(job))
                .thenReturn(job);

        Job result = jobService.close(1L);

        assertEquals(Job.Status.CLOSED, result.getStatus());

        verify(jobRepository).save(job);
    }

    @Test
    void search_shouldReturnMatchingJobs() {

        List<Job> jobs = List.of(new Job());

        when(jobRepository.search("Java", "Hyderabad", 2))
                .thenReturn(jobs);

        List<Job> result =
                jobService.search("Java", "Hyderabad", 2);

        assertEquals(1, result.size());

        verify(jobRepository)
                .search("Java", "Hyderabad", 2);
    }

    @Test
    void getJobsByRecruiter_shouldReturnRecruiterJobs() {

        List<Job> jobs = List.of(new Job(), new Job());

        when(jobRepository.findByRecruiterId(10L))
                .thenReturn(jobs);

        List<Job> result =
                jobService.getJobsByRecruiter(10L);

        assertEquals(2, result.size());

        verify(jobRepository)
                .findByRecruiterId(10L);
    }

    @Test
    void getById_shouldReturnJob_whenExists() {

        Job job = new Job();
        job.setId(1L);

        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(job));

        Job result = jobService.getById(1L);

        assertEquals(1L, result.getId());
    }

    @Test
    void getById_shouldThrowException_whenJobDoesNotExist() {

        when(jobRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalStateException.class,
                () -> jobService.getById(999L)
        );
    }
}