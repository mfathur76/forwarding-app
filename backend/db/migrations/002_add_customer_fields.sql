-- Add customer fields in an idempotent way.

ALTER TABLE customers ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL';

ALTER TABLE customers ALTER COLUMN npwp TYPE VARCHAR(32);

ALTER TABLE customers DROP COLUMN IF EXISTS company_name;
