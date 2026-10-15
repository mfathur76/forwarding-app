-- Drivers table already exists from the initial schema.
-- This migration only adds supporting indexes and stays safe to re-run.

CREATE INDEX IF NOT EXISTS idx_drivers_name
ON drivers(name);

CREATE INDEX IF NOT EXISTS idx_drivers_status
ON drivers(status);

CREATE INDEX IF NOT EXISTS idx_drivers_deleted_at
ON drivers(deleted_at);