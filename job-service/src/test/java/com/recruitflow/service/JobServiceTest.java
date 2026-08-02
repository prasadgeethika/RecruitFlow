package com.recruitflow.service;

import com.recruitflow.model.Job;
import com.recruitflow.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobService jobService;

    @Test
    void testSearchWithSingleFilter() {

        Job job = new Job();
        job.setTitle("Java Developer");
        job.setSkills("java,spring");

        when(jobRepository.search("java", null, null))
                .thenReturn(List.of(job));

        List<Job> result = jobService.search("java", null, null);

        assertEquals(1, result.size());
        assertEquals("Java Developer", result.get(0).getTitle());

        verify(jobRepository).search("java", null, null);
    }

    @Test
    void testSearchWithMultipleFilters() {

        Job job = new Job();
        job.setTitle("Senior Java Developer");
        job.setSkills("java,spring");
        job.setLocation("Hyderabad");
        job.setExperienceRequired(5);

        when(jobRepository.search("java", "Hyderabad", 5))
                .thenReturn(List.of(job));

        List<Job> result =
                jobService.search("java", "Hyderabad", 5);

        assertEquals(1, result.size());
        assertEquals("Hyderabad", result.get(0).getLocation());
        assertEquals(5, result.get(0).getExperienceRequired());

        verify(jobRepository)
                .search("java", "Hyderabad", 5);
    }

    @Test
    void testSearchWithNoMatch() {

        when(jobRepository.search("python", "Delhi", 10))
                .thenReturn(List.of());

        List<Job> result =
                jobService.search("python", "Delhi", 10);

        assertTrue(result.isEmpty());

        verify(jobRepository)
                .search("python", "Delhi", 10);
    }
}