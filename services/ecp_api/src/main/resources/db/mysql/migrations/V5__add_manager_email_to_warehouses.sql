-- Migration V5: Add manager_email column to warehouses table
ALTER TABLE warehouses ADD COLUMN manager_email VARCHAR(255) NULL AFTER address;
