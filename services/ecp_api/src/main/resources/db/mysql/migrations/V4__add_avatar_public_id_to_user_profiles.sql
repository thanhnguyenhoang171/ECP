-- Migration V4: Add avatar_public_id column to user_profiles table for Cloudinary metadata

ALTER TABLE user_profiles ADD COLUMN avatar_public_id VARCHAR(255) NULL AFTER avatar_url;
