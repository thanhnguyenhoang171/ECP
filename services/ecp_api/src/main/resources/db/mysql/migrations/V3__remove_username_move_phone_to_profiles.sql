-- Migration V3: Move phone_number from users table to user_profiles table and drop username column

-- 1. Add phone_number column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN phone_number VARCHAR(20) NULL;

-- 2. Migrate existing phone_number data from users to user_profiles
UPDATE user_profiles up
JOIN users u ON up.user_id = u.id
SET up.phone_number = u.phone_number
WHERE u.phone_number IS NOT NULL;

-- 3. Drop username column from users table
ALTER TABLE users DROP COLUMN username;

-- 4. Drop phone_number column from users table
ALTER TABLE users DROP COLUMN phone_number;
