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
 * Executes .sql files from classpath:/db/mysql/migrations/
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
                    log.info("Processing: {}", filename);

                    try (InputStream is = Files.newInputStream(file)) {
                        String sql = new String(is.readAllBytes());
                        String[] statements = sql.split(";");

                        for (String statement : statements) {
                            String trimmed = statement.trim();
                            if (!trimmed.isEmpty()) {
                                jdbcTemplate.execute(trimmed);
                                totalStatements++;
                            }
                        }

                        log.info("✓ Completed: {} ({} statements)", filename, statements.length);

                    } catch (Exception e) {
                        log.error("✗ Failed: {}", filename, e);
                        throw e;
                    }
                }

                log.info("MySQL: {} SQL statements executed", totalStatements);
            }
        };
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
