-- Migration V3: Move phone_number from users table to user_profiles table and drop username column safely
SET @dbname = DATABASE();

-- 1. Add phone_number column to user_profiles table if missing
SET @tablename = "user_profiles";
SET @columnname = "phone_number";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE user_profiles ADD COLUMN phone_number VARCHAR(20) NULL"
));
PREPARE addCol1 FROM @preparedStatement;
EXECUTE addCol1;
DEALLOCATE PREPARE addCol1;

-- 2. Migrate existing phone_number data from users to user_profiles if users.phone_number exists
SET @tablename = "users";
SET @columnname = "phone_number";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "UPDATE user_profiles up JOIN users u ON up.user_id = u.id SET up.phone_number = u.phone_number WHERE u.phone_number IS NOT NULL",
  "SELECT 1"
));
PREPARE migData FROM @preparedStatement;
EXECUTE migData;
DEALLOCATE PREPARE migData;

-- 3. Drop username column from users table if exists
SET @tablename = "users";
SET @columnname = "username";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "ALTER TABLE users DROP COLUMN username",
  "SELECT 1"
));
PREPARE dropCol1 FROM @preparedStatement;
EXECUTE dropCol1;
DEALLOCATE PREPARE dropCol1;

-- 4. Drop phone_number column from users table if exists
SET @tablename = "users";
SET @columnname = "phone_number";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "ALTER TABLE users DROP COLUMN phone_number",
  "SELECT 1"
));
PREPARE dropCol2 FROM @preparedStatement;
EXECUTE dropCol2;
DEALLOCATE PREPARE dropCol2;
