-- Migration V5: Add manager_email column to warehouses table safely
SET @dbname = DATABASE();
SET @tablename = "warehouses";
SET @columnname = "manager_email";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename
  ) > 0 AND (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) = 0,
  "ALTER TABLE warehouses ADD COLUMN manager_email VARCHAR(255) NULL AFTER address",
  "SELECT 1"
));
PREPARE addColumnIfNotExists FROM @preparedStatement;
EXECUTE addColumnIfNotExists;
DEALLOCATE PREPARE addColumnIfNotExists;
