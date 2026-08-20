-- Migration: Add expected_delivery_date column to purchase_orders table safely
SET @dbname = DATABASE();
SET @tablename = "purchase_orders";
SET @columnname = "expected_delivery_date";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE purchase_orders ADD COLUMN expected_delivery_date DATETIME NULL AFTER note"
));
PREPARE addColumnIfNotExists FROM @preparedStatement;
EXECUTE addColumnIfNotExists;
DEALLOCATE PREPARE addColumnIfNotExists;

