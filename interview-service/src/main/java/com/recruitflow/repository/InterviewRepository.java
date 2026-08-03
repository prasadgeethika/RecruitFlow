package com.recruitflow.repository;

import com.recruitflow.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    Optional<Interview> findByApplicationId(Long applicationId);
}