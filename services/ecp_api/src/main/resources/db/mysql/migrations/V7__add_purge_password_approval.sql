ALTER TABLE user_purge_credentials
    ADD COLUMN approved BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN approved_by VARCHAR(255) NULL,
    ADD COLUMN approved_at DATETIME(6) NULL;
