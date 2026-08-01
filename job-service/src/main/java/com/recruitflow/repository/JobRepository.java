package com.recruitflow.repository;

import com.recruitflow.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("""
        SELECT j FROM Job j
        WHERE j.status = 'OPEN'
        AND (:skill IS NULL OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :skill, '%')))
        AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
        AND (:minExperience IS NULL OR j.experienceRequired <= :minExperience)
    """)
    List<Job> search(@Param("skill") String skill,
                     @Param("location") String location,
                     @Param("minExperience") Integer minExperience);
}