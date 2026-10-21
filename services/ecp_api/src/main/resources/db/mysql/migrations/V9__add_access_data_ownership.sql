-- Hibernate ddl-auto=update or an interrupted MySQL migration may have already
-- created part of this schema. Preserve existing ownership and finish missing DDL.
SET @ecp_ownership_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns
           WHERE table_schema = DATABASE() AND table_name = 'roles' AND column_name = 'created_by'),
    'SELECT 1',
    'ALTER TABLE roles ADD COLUMN created_by VARCHAR(255) NULL'
);
PREPARE ecp_ownership_statement FROM @ecp_ownership_ddl;
EXECUTE ecp_ownership_statement;
DEALLOCATE PREPARE ecp_ownership_statement;

SET @ecp_ownership_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns
           WHERE table_schema = DATABASE() AND table_name = 'permissions' AND column_name = 'created_by'),
    'SELECT 1',
    'ALTER TABLE permissions ADD COLUMN created_by VARCHAR(255) NULL'
);
PREPARE ecp_ownership_statement FROM @ecp_ownership_ddl;
EXECUTE ecp_ownership_statement;
DEALLOCATE PREPARE ecp_ownership_statement;

SET @ecp_ownership_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.statistics
           WHERE table_schema = DATABASE() AND table_name = 'roles' AND index_name = 'idx_roles_created_by'),
    'SELECT 1',
    'CREATE INDEX idx_roles_created_by ON roles(created_by)'
);
PREPARE ecp_ownership_statement FROM @ecp_ownership_ddl;
EXECUTE ecp_ownership_statement;
DEALLOCATE PREPARE ecp_ownership_statement;

SET @ecp_ownership_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.statistics
           WHERE table_schema = DATABASE() AND table_name = 'permissions' AND index_name = 'idx_permissions_created_by'),
    'SELECT 1',
    'CREATE INDEX idx_permissions_created_by ON permissions(created_by)'
);
PREPARE ecp_ownership_statement FROM @ecp_ownership_ddl;
EXECUTE ecp_ownership_statement;
DEALLOCATE PREPARE ecp_ownership_statement;
