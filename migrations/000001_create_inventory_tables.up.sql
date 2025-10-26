-- Inventory Module Database Schema
-- This migration creates module-specific tables for the inventory management system
-- Note: products and product_categories are in core (004_create_core_essential_tables.sql)

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Locations within warehouses
CREATE TABLE IF NOT EXISTS stock_locations (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    location_type VARCHAR(50) DEFAULT 'shelf', -- shelf, bin, floor, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, code)
);

-- Stock Levels (current inventory)
CREATE TABLE IF NOT EXISTS stock_levels (
    id SERIAL PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    location_id INTEGER REFERENCES stock_locations(id),
    quantity_on_hand INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    last_counted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, warehouse_id, location_id)
);

-- Stock Movements (inventory transactions)
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    location_id INTEGER REFERENCES stock_locations(id),
    movement_type VARCHAR(50) NOT NULL, -- in, out, transfer, adjustment
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50), -- purchase_order, sales_order, transfer, adjustment, etc.
    reference_id INTEGER,
    reason VARCHAR(255),
    notes TEXT,
    user_id INTEGER, -- who performed the movement
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Adjustments
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id SERIAL PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    location_id INTEGER REFERENCES stock_locations(id),
    adjustment_type VARCHAR(50) NOT NULL, -- count, damage, loss, found
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    quantity_adjusted INTEGER GENERATED ALWAYS AS (quantity_after - quantity_before) STORED,
    reason VARCHAR(255),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    approved_by INTEGER,
    approved_at TIMESTAMP,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Serial Numbers
CREATE TABLE IF NOT EXISTS serial_numbers (
    id SERIAL PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id),
    location_id INTEGER REFERENCES stock_locations(id),
    status VARCHAR(20) DEFAULT 'available', -- available, sold, returned, damaged
    purchase_date DATE,
    warranty_expiry DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batch Numbers
CREATE TABLE IF NOT EXISTS batch_numbers (
    id SERIAL PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    batch_number VARCHAR(255) NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id),
    location_id INTEGER REFERENCES stock_locations(id),
    quantity INTEGER NOT NULL,
    quantity_remaining INTEGER NOT NULL,
    manufacture_date DATE,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, expired, depleted
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, batch_number, warehouse_id, location_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_levels_product ON stock_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_warehouse ON stock_levels(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_product ON serial_numbers(product_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_serial ON serial_numbers(serial_number);
CREATE INDEX IF NOT EXISTS idx_batch_numbers_product ON batch_numbers(product_id);
CREATE INDEX IF NOT EXISTS idx_batch_numbers_batch ON batch_numbers(batch_number);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_locations_updated_at BEFORE UPDATE ON stock_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_levels_updated_at BEFORE UPDATE ON stock_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_adjustments_updated_at BEFORE UPDATE ON stock_adjustments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_serial_numbers_updated_at BEFORE UPDATE ON serial_numbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batch_numbers_updated_at BEFORE UPDATE ON batch_numbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
