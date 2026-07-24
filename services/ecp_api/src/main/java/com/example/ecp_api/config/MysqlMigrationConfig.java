package com.example.ecp_api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * MySQL Migrations Runner
 * Executes .sql files from classpath:/db/mysql/migrations/ with version tracking via schema_migrations table.
 */
@Configuration
@Slf4j
public class MysqlMigrationConfig {

    private static final String MYSQL_DIR = "db/mysql/migrations";

    @Bean
    @SuppressWarnings("unused")
    public CommandLineRunner runMysqlMigrations(JdbcTemplate jdbcTemplate) {
        return args -> {
            log.info("--- MySQL Migrations ---");
            Path migrationPath = getMigrationPath();

            if (!Files.exists(migrationPath)) {
                log.info("No MySQL migrations directory found at: {}", MYSQL_DIR);
                return;
            }

            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(255) PRIMARY KEY, applied_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
            } catch (Exception e) {
                log.warn("Could not create or verify schema_migrations table: {}", e.getMessage());
            }

            try (Stream<Path> files = Files.list(migrationPath)) {
                List<Path> migrationFiles = files
                        .filter(p -> p.getFileName().toString().endsWith(".sql"))
                        .sorted()
                        .collect(Collectors.toList());

                if (migrationFiles.isEmpty()) {
                    log.info("No MySQL migration files found");
                    return;
                }

                log.info("Found {} MySQL migration files", migrationFiles.size());

                int totalStatements = 0;
                for (Path file : migrationFiles) {
                    String filename = file.getFileName().toString();

                    try {
                        Integer count = jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM schema_migrations WHERE version = ?", Integer.class, filename);
                        if (count != null && count > 0) {
                            log.info("✓ Skipping already executed migration: {}", filename);
                            continue;
                        }
                    } catch (Exception e) {
                        log.debug("Failed to check migration version: {}", e.getMessage());
                    }

                    log.info("Processing: {}", filename);

                    try (InputStream is = Files.newInputStream(file)) {
                        String sql = new String(is.readAllBytes());
                        String[] statements = sql.split(";");
                        int fileStatements = 0;

                        for (String statement : statements) {
                            String trimmed = statement.trim();
                            if (!trimmed.isEmpty()) {
                                jdbcTemplate.execute(trimmed);
                                fileStatements++;
                                totalStatements++;
                            }
                        }

                        recordMigrationApplied(jdbcTemplate, filename);
                        log.info("✓ Completed: {} ({} statements)", filename, fileStatements);

                    } catch (Exception e) {
                        if (isDuplicateColumnException(e)) {
                            log.warn("Column already exists in database for migration: {}. Marking migration as applied.", filename);
                            recordMigrationApplied(jdbcTemplate, filename);
                        } else {
                            log.error("✗ Failed: {}", filename, e);
                            throw e;
                        }
                    }
                }

                log.info("MySQL: {} SQL statements executed", totalStatements);
            }
        };
    }

    private void recordMigrationApplied(JdbcTemplate jdbcTemplate, String filename) {
        try {
            jdbcTemplate.update("INSERT INTO schema_migrations (version) VALUES (?) ON DUPLICATE KEY UPDATE version = version", filename);
        } catch (Exception ex) {
            log.warn("Failed to record migration in schema_migrations table for file: {}", filename, ex);
        }
    }

    private boolean isDuplicateColumnException(Throwable e) {
        if (e == null) {
            return false;
        }
        String msg = e.getMessage();
        if (msg != null && (msg.contains("Duplicate column name") || msg.contains("1060"))) {
            return true;
        }
        return isDuplicateColumnException(e.getCause());
    }

    private Path getMigrationPath() {
        try {
            var resource = new ClassPathResource(MYSQL_DIR);
            return Path.of(resource.getURI());
        } catch (Exception e) {
            throw new IllegalStateException("Cannot access MySQL migration directory: " + MYSQL_DIR, e);
        }
    }
}
