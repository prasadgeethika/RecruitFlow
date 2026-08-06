package com.recruitflow.repository;

import com.recruitflow.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    @Query(value = """
SELECT *
FROM jobs
WHERE status = 'OPEN'
  AND (:skill IS NULL OR LOWER(skills) LIKE LOWER(CONCAT('%', :skill, '%')))
  AND (:location IS NULL OR LOWER(location) LIKE LOWER(CONCAT('%', :location, '%')))
  AND (:minExperience IS NULL OR experience_required <= :minExperience)
""", nativeQuery = true)
    List<Job> search(@Param("skill") String skill,
                     @Param("location") String location,
                     @Param("minExperience") Integer minExperience);

    List<Job> findByRecruiterId(Long recruiterId);
}