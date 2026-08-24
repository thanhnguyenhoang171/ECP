-- Migration V4: Add avatar_public_id column to user_profiles table safely
SET @dbname = DATABASE();
SET @tablename = "user_profiles";
SET @columnname = "avatar_public_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename
  ) > 0 AND (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) = 0,
  "ALTER TABLE user_profiles ADD COLUMN avatar_public_id VARCHAR(255) NULL AFTER avatar_url",
  "SELECT 1"
));
PREPARE addColumnIfNotExists FROM @preparedStatement;
EXECUTE addColumnIfNotExists;
DEALLOCATE PREPARE addColumnIfNotExists;
