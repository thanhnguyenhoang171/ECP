-- deleted_at used to have @UpdateTimestamp, so ordinary saves populated it.
-- Administrative soft deletion explicitly records deleted_by; retain those records.
UPDATE users SET deleted_at = NULL WHERE deleted_by IS NULL;
