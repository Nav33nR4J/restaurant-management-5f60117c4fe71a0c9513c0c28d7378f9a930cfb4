-- Migration script to update promotions table to new schema (MySQL)
-- Run this to update an existing promotions table

-- Add new columns using separate statements (MySQL syntax)
-- Note: MySQL doesn't support ADD COLUMN IF NOT EXISTS, so we check first

-- Add promo_code column if it doesn't exist
-- This is a workaround for MySQL
-- Run each statement manually or use a tool that handles this

-- 1. Add new columns
-- ALTER TABLE promotions ADD COLUMN promo_code VARCHAR(50) UNIQUE;
-- ALTER TABLE promotions ADD COLUMN type ENUM('percentage', 'fixed', 'custom');
-- ALTER TABLE promotions ADD COLUMN value DECIMAL(10,2) DEFAULT 0;
-- ALTER TABLE promotions ADD COLUMN start_at DATETIME;
-- ALTER TABLE promotions ADD COLUMN end_at DATETIME;
-- ALTER TABLE promotions ADD COLUMN usage_limit INT DEFAULT NULL;
-- ALTER TABLE promotions ADD COLUMN usage_count INT DEFAULT 0;
-- ALTER TABLE promotions ADD COLUMN max_discount_amount DECIMAL(10,2);
-- ALTER TABLE promotions ADD COLUMN custom_items JSON;

-- 2. Copy data from old columns to new columns
-- UPDATE promotions SET promo_code = code WHERE (promo_code IS NULL OR promo_code = '') AND code IS NOT NULL;
-- UPDATE promotions SET type = discount_type WHERE type IS NULL AND discount_type IS NOT NULL;
-- UPDATE promotions SET value = discount_value WHERE value IS NULL AND discount_value IS NOT NULL;
-- UPDATE promotions SET start_at = start_date WHERE start_at IS NULL AND start_date IS NOT NULL;
-- UPDATE promotions SET end_at = end_date WHERE end_at IS NULL AND end_date IS NOT NULL;
-- UPDATE promotions SET max_discount_amount = max_discount WHERE max_discount_amount IS NULL AND max_discount IS NOT NULL;
-- UPDATE promotions SET usage_count = 0 WHERE usage_count IS NULL;

-- 3. Drop old columns (only after data has been migrated)
-- ALTER TABLE promotions DROP COLUMN code;
-- ALTER TABLE promotions DROP COLUMN discount_type;
-- ALTER TABLE promotions DROP COLUMN discount_value;
-- ALTER TABLE promotions DROP COLUMN start_date;
-- ALTER TABLE promotions DROP COLUMN end_date;
-- ALTER TABLE promotions DROP COLUMN max_discount;

-- Alternative: If you want to recreate the table completely:
-- 1. Create backup
-- CREATE TABLE promotions_backup AS SELECT * FROM promotions;

-- 2. Drop old table
-- DROP TABLE promotions;

-- 3. Create new table with correct schema
-- CREATE TABLE promotions (
--     id VARCHAR(36) PRIMARY KEY,
--     promo_code VARCHAR(50) UNIQUE,
--     title VARCHAR(255) NOT NULL,
--     description TEXT,
--     type ENUM('percentage', 'fixed', 'custom') NOT NULL,
--     value DECIMAL(10,2) NOT NULL DEFAULT 0,
--     start_at DATETIME,
--     end_at DATETIME,
--     is_active BOOLEAN DEFAULT true,
--     usage_limit INT DEFAULT NULL,
--     usage_count INT DEFAULT 0,
--     min_order_amount DECIMAL(10,2) DEFAULT 0,
--     max_discount_amount DECIMAL(10,2),
--     custom_items JSON,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- 4. Insert data from backup (mapping old column names to new)
-- INSERT INTO promotions (id, promo_code, title, description, type, value, start_at, end_at, is_active, min_order_amount, max_discount_amount, created_at)
-- SELECT id, code, title, description, discount_type, discount_value, start_date, end_date, is_active, min_order_amount, max_discount, created_at
-- FROM promotions_backup;

-- 5. Drop backup table
-- DROP TABLE promotions_backup;

SELECT 'Please run the migration steps manually or recreate the table' AS status;
