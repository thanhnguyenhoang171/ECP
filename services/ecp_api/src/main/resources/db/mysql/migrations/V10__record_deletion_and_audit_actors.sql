SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'suppliers' AND column_name = 'deleted_at'),
    'SELECT 1', 'ALTER TABLE suppliers ADD COLUMN deleted_at DATETIME(6) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;

SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'suppliers' AND column_name = 'deleted_by'),
    'SELECT 1', 'ALTER TABLE suppliers ADD COLUMN deleted_by VARCHAR(255) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;

SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'warehouses' AND column_name = 'deleted_at'),
    'SELECT 1', 'ALTER TABLE warehouses ADD COLUMN deleted_at DATETIME(6) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;

SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'warehouses' AND column_name = 'deleted_by'),
    'SELECT 1', 'ALTER TABLE warehouses ADD COLUMN deleted_by VARCHAR(255) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;

SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'purchase_orders' AND column_name = 'deleted_at'),
    'SELECT 1', 'ALTER TABLE purchase_orders ADD COLUMN deleted_at DATETIME(6) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;

SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'purchase_orders' AND column_name = 'deleted_by'),
    'SELECT 1', 'ALTER TABLE purchase_orders ADD COLUMN deleted_by VARCHAR(255) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;

SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'goods_receipts' AND column_name = 'deleted_at'),
    'SELECT 1', 'ALTER TABLE goods_receipts ADD COLUMN deleted_at DATETIME(6) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;

SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'goods_receipts' AND column_name = 'deleted_by'),
    'SELECT 1', 'ALTER TABLE goods_receipts ADD COLUMN deleted_by VARCHAR(255) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;

SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'inventory' AND column_name = 'created_by'),
    'SELECT 1', 'ALTER TABLE inventory ADD COLUMN created_by VARCHAR(255) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;

SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'inventory' AND column_name = 'updated_by'),
    'SELECT 1', 'ALTER TABLE inventory ADD COLUMN updated_by VARCHAR(255) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;

SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'inventory_ledgers' AND column_name = 'created_by'),
    'SELECT 1', 'ALTER TABLE inventory_ledgers ADD COLUMN created_by VARCHAR(255) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;

SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'roles' AND column_name = 'updated_by'),
    'SELECT 1', 'ALTER TABLE roles ADD COLUMN updated_by VARCHAR(255) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;

SET @ecp_record_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'permissions' AND column_name = 'updated_by'),
    'SELECT 1', 'ALTER TABLE permissions ADD COLUMN updated_by VARCHAR(255) NULL'
);
PREPARE ecp_record_statement FROM @ecp_record_ddl;
EXECUTE ecp_record_statement;
DEALLOCATE PREPARE ecp_record_statement;
