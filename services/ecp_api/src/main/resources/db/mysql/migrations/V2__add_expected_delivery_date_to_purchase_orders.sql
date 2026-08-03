-- Migration: Add expected_delivery_date column to purchase_orders table
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS expected_delivery_date DATETIME NULL AFTER note;

