package com.recruitflow.repository;

import com.recruitflow.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    Optional<JobApplication> findByCandidateIdAndJobId(Long candidateId, Long jobId);
    List<JobApplication> findByCandidateId(Long candidateId);
    List<JobApplication> findByJobId(Long jobId);
}