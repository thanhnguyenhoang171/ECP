package com.example.ecp_api.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.index.CompoundIndexDefinition;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexOperations;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

/**
 * Simple Migration Runner for MongoDB
 * - Reads .json files from classpath:/db/migrations/
 * - Sorts by filename (V1__, V2__, etc.)
 */
@Configuration
@Slf4j
public class MongoMigrationConfig {

    private static final String MONGODB_DIR = "db/migrations";

    @Bean
    @SuppressWarnings("unused")
    public CommandLineRunner runMongodbMigrations(MongoTemplate mongoTemplate, ObjectMapper objectMapper) {
        return args -> {
            log.info("--- MongoDB Migrations ---");
            Path migrationPath = getMigrationPath();

            if (!Files.exists(migrationPath)) {
                log.info("No MongoDB migrations directory found at: {}", MONGODB_DIR);
                return;
            }

            try (var stream = Files.list(migrationPath)) {
                List<Path> migrationFiles = stream
                        .filter(p -> p.getFileName().toString().endsWith(".json"))
                        .sorted()
                        .toList();

                if (migrationFiles.isEmpty()) {
                    log.info("No MongoDB migration files found");
                    return;
                }

                log.info("Found {} MongoDB migration files", migrationFiles.size());

                int totalOps = 0;
                for (Path file : migrationFiles) {
                    String filename = file.getFileName().toString();
                    log.info("Processing: {}", filename);

                    try (InputStream is = Files.newInputStream(file)) {
                        List<Map<String, Object>> operations = objectMapper.readValue(is,
                                new TypeReference<>() {});

                        for (Map<String, Object> op : operations) {
                            totalOps++;
                            executeMongodbOperation(mongoTemplate, op);
                        }

                        log.info("✓ Completed: {} ({} operations)", filename, operations.size());

                    } catch (Exception e) {
                        log.error("✗ Failed: {}", filename, e);
                        throw e;
                    }
                }

                log.info("MongoDB: {} operations executed", totalOps);
            }
        };
    }

    private Path getMigrationPath() {
        try {
            var resource = new ClassPathResource(MONGODB_DIR);
            return Path.of(resource.getURI());
        } catch (Exception e) {
            throw new IllegalStateException("Cannot access MongoDB migration directory: " + MONGODB_DIR, e);
        }
    }

    private void executeMongodbOperation(MongoTemplate mongoTemplate, Map<String, Object> op) {
        String collection = (String) op.get("collection");
        String operation = (String) op.get("operation");

        @SuppressWarnings("unchecked")
        Map<String, Object> filterMap = (Map<String, Object>) op.get("filter");
        @SuppressWarnings("unchecked")
        Map<String, Object> updateMap = (Map<String, Object>) op.get("update");

        Document filter = new Document(filterMap);
        Document update = new Document(updateMap);

        switch (operation) {
            case "updateMany" -> {
                long modified = mongoTemplate.getCollection(collection)
                        .updateMany(filter, update)
                        .getModifiedCount();
                log.debug("  → Updated {} documents in '{}'", modified, collection);
            }
            case "deleteMany" -> {
                long deleted = mongoTemplate.getCollection(collection)
                        .deleteMany(filter)
                        .getDeletedCount();
                log.debug("  → Deleted {} documents from '{}'", deleted, collection);
            }
            case "createIndex" -> {
                String fields = (String) op.get("fields");
                boolean unique = (Boolean) op.getOrDefault("unique", false);

                IndexOperations indexOps = mongoTemplate.indexOps(collection);
                Index indexDefinition;

                if (!fields.contains(":")) {
                    // Single field index
                    indexDefinition = new Index().on(fields, Sort.Direction.ASC);
                } else {
                    // Compound index like "parentId:1,order:-1"
                    Document indexKeys = new Document();
                    String[] parts = fields.split(",");
                    for (String part : parts) {
                        String[] kv = part.split(":");
                        String field = kv[0].trim();
                        int dir = Integer.parseInt(kv[1].trim());
                        indexKeys.append(field, dir);
                    }
                    indexDefinition = new CompoundIndexDefinition(indexKeys);
                }

                if (unique) {
                    indexDefinition.unique();
                }

                indexOps.createIndex(indexDefinition);

                log.info("  → Created index on '{}': {}", collection, fields);
            }
            default -> throw new IllegalArgumentException("Unsupported MongoDB operation: " + operation);
        }
    }
}
