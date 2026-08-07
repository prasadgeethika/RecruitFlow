package com.recruitflow.service;

import com.recruitflow.dto.CreateJobRequest;
import com.recruitflow.model.Job;
import com.recruitflow.repository.JobRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class JobService {
    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public Job create(CreateJobRequest req) {
        Job job = new Job();
        job.setTitle(req.title());
        job.setDescription(req.description());
        job.setSkills(req.skills());
        job.setLocation(req.location());
        job.setExperienceRequired(req.experienceRequired());
        job.setRecruiterId(req.recruiterId());
        job.setStatus(Job.Status.DRAFT);
        return jobRepository.save(job);
    }

    public Job edit(Long id, CreateJobRequest req) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Job not found"));

        if (job.getStatus() != Job.Status.DRAFT) {
            throw new IllegalStateException(
                    "Only draft jobs can be edited. Close the job and create a new one instead."
            );
        }

        job.setTitle(req.title());
        job.setDescription(req.description());
        job.setSkills(req.skills());
        job.setLocation(req.location());
        job.setExperienceRequired(req.experienceRequired());
        return jobRepository.save(job);
    }

    public Job close(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Job not found"));
        job.setStatus(Job.Status.CLOSED);
        return jobRepository.save(job);
    }

    public Job open(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Job not found"));
        job.setStatus(Job.Status.OPEN);
        return jobRepository.save(job);
    }

    public List<Job> search(String skill, String location, Integer experience) {
        return jobRepository.search(skill, location, experience);
    }

    public List<Job> getJobsByRecruiter(Long recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId);
    }

    // Needed so application-service can look up which recruiter owns a job,
    // to notify them when a candidate applies.
    public Job getById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Job not found"));
    }
}