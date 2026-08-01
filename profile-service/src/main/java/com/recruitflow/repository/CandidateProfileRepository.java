package com.recruitflow.repository;

import com.recruitflow.model.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {
    Optional<CandidateProfile> findByUserId(Long userId);
}
