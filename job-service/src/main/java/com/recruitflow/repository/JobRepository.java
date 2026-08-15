package com.recruitflow.repository;

import com.recruitflow.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    // Fuzzy, typo-tolerant search using PostgreSQL's pg_trgm extension
    // (see PgTrgmInitializer) instead of a separate search service.
    // word_similarity(query, text) finds the best-matching word/phrase
    // inside `text` for a possibly-typo'd `query` - handles "jva" -> "Java"
    // and "spng" -> "Spring" naturally. Combined with a plain substring
    // ILIKE as a belt-and-suspenders fallback for very short query terms
    // where trigram similarity alone is weak.
    @Query(value = """
SELECT *
FROM jobs
WHERE status = 'OPEN'
  AND (:skill IS NULL OR :skill = ''
       OR word_similarity(:skill, title) > 0.25
       OR word_similarity(:skill, skills) > 0.25
       OR LOWER(title) LIKE LOWER(CONCAT('%', :skill, '%'))
       OR LOWER(skills) LIKE LOWER(CONCAT('%', :skill, '%')))
  AND (:location IS NULL OR :location = ''
       OR word_similarity(:location, location) > 0.3
       OR LOWER(location) LIKE LOWER(CONCAT('%', :location, '%')))
  AND (:minExperience IS NULL OR experience_required <= :minExperience)
ORDER BY GREATEST(
    word_similarity(COALESCE(:skill, ''), title),
    word_similarity(COALESCE(:skill, ''), skills)
) DESC
""", nativeQuery = true)
    List<Job> search(@Param("skill") String skill,
                     @Param("location") String location,
                     @Param("minExperience") Integer minExperience);

    List<Job> findByRecruiterId(Long recruiterId);
}