-- Schema fase 1 untuk aplikasi forwarding
-- PostgreSQL 16+

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabel users (minimum untuk auth admin)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'admin_operasional',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO users (full_name, email, password_hash, role, is_active)
VALUES (
  'Admin Operasional',
  'admin@forwarding.local',
  crypt('admin123', gen_salt('bf')),
  'admin_operasional',
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Sequence nomor dokumen global
CREATE TABLE IF NOT EXISTS document_sequences (
  key VARCHAR(40) PRIMARY KEY,
  last_value BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO document_sequences (key, last_value)
VALUES ('shipment', 0), ('invoice', 0)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL',
  company VARCHAR(160),
  phone VARCHAR(40),
  email VARCHAR(160),
  npwp VARCHAR(32),
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(40),
  license_number VARCHAR(80) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'TERSEDIA',
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT drivers_status_check CHECK (status IN ('TERSEDIA', 'BERTUGAS', 'NONAKTIF'))
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_drivers_license_number
  ON drivers (license_number)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number VARCHAR(20) NOT NULL,
  vehicle_type VARCHAR(80) NOT NULL,
  brand VARCHAR(80),
  capacity_kg NUMERIC(12, 2) NOT NULL DEFAULT 0,
  year SMALLINT,
  status VARCHAR(20) NOT NULL DEFAULT 'TERSEDIA',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT vehicles_status_check CHECK (status IN ('TERSEDIA', 'BERTUGAS', 'PERAWATAN', 'NONAKTIF')),
  CONSTRAINT vehicles_capacity_check CHECK (capacity_kg >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_vehicles_plate_number
  ON vehicles (plate_number)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number VARCHAR(40) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  origin VARCHAR(180) NOT NULL,
  destination VARCHAR(180) NOT NULL,
  weight_kg NUMERIC(12, 2) NOT NULL DEFAULT 0,
  price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  pickup_date DATE,
  delivery_date DATE,
  cargo_description TEXT,
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'MENUNGGU',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT shipments_status_check CHECK (status IN ('MENUNGGU', 'DALAM_PERJALANAN', 'TERKIRIM', 'DIBATALKAN')),
  CONSTRAINT shipments_weight_check CHECK (weight_kg >= 0),
  CONSTRAINT shipments_price_check CHECK (price >= 0),
  CONSTRAINT shipments_date_check CHECK (
    delivery_date IS NULL
    OR pickup_date IS NULL
    OR delivery_date >= pickup_date
  )
);

CREATE INDEX IF NOT EXISTS ix_shipments_customer_id ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS ix_shipments_driver_id ON shipments(driver_id);
CREATE INDEX IF NOT EXISTS ix_shipments_vehicle_id ON shipments(vehicle_id);
CREATE INDEX IF NOT EXISTS ix_shipments_status ON shipments(status);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(40) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  shipment_id UUID NOT NULL UNIQUE REFERENCES shipments(id),
  issued_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total NUMERIC(14, 2) NOT NULL,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'BELUM_BAYAR',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT invoices_amount_check CHECK (amount >= 0),
  CONSTRAINT invoices_tax_check CHECK (tax >= 0),
  CONSTRAINT invoices_total_check CHECK (total >= 0),
  CONSTRAINT invoices_due_date_check CHECK (due_date >= issued_date),
  CONSTRAINT invoices_status_check CHECK (payment_status IN ('BELUM_BAYAR', 'SEBAGIAN', 'LUNAS', 'LEWAT_JATUH_TEMPO')),
  CONSTRAINT invoices_total_formula_check CHECK (total = amount + tax)
);

CREATE INDEX IF NOT EXISTS ix_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS ix_invoices_payment_status ON invoices(payment_status);

-- Trigger util: auto update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_drivers_updated_at ON drivers;
CREATE TRIGGER trg_drivers_updated_at
BEFORE UPDATE ON drivers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON vehicles;
CREATE TRIGGER trg_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_shipments_updated_at ON shipments;
CREATE TRIGGER trg_shipments_updated_at
BEFORE UPDATE ON shipments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_invoices_updated_at ON invoices;
CREATE TRIGGER trg_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
