package com.recruitflow.search;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

// Enables the pg_trgm extension (ships with standard Postgres, just needs
// turning on) so JobRepository.search() can use word_similarity() for
// typo-tolerant search. Runs on every boot; CREATE EXTENSION IF NOT EXISTS
// is a no-op after the first successful run.
@Component
public class PgTrgmInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(PgTrgmInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public PgTrgmInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm");
            log.info("pg_trgm extension is enabled - fuzzy job search is active");
        } catch (Exception e) {
            // If your DB user lacks CREATE privilege, run this once manually
            // as a superuser: CREATE EXTENSION pg_trgm;
            log.error("Could not enable pg_trgm - job search will fail until this is fixed. " +
                            "Run 'CREATE EXTENSION pg_trgm;' manually against job_db as a superuser. Cause: {}",
                    e.getMessage());
        }
    }
}
