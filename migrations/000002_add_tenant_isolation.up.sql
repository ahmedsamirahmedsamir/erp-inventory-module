-- Add tenant isolation to inventory module tables
-- This migration adds tenant_id columns and updates constraints for multi-tenant support

-- Add tenant_id to all inventory module tables
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE stock_locations ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE stock_levels ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE serial_numbers ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE batch_numbers ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Update unique constraints to include tenant_id
ALTER TABLE warehouses DROP CONSTRAINT IF EXISTS warehouses_code_key;
ALTER TABLE warehouses ADD CONSTRAINT warehouses_tenant_code_unique UNIQUE(tenant_id, code);

ALTER TABLE stock_locations DROP CONSTRAINT IF EXISTS stock_locations_warehouse_id_code_key;
ALTER TABLE stock_locations ADD CONSTRAINT stock_locations_tenant_warehouse_code_unique UNIQUE(tenant_id, warehouse_id, code);

-- Add indexes on tenant_id for all tables
CREATE INDEX IF NOT EXISTS idx_warehouses_tenant ON warehouses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_locations_tenant ON stock_locations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_tenant ON stock_levels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant ON stock_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_tenant ON stock_adjustments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_tenant ON serial_numbers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_batch_numbers_tenant ON batch_numbers(tenant_id);

-- Add foreign keys to tenants table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouses_tenant_fk') THEN
        ALTER TABLE warehouses ADD CONSTRAINT warehouses_tenant_fk 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stock_locations_tenant_fk') THEN
        ALTER TABLE stock_locations ADD CONSTRAINT stock_locations_tenant_fk 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stock_levels_tenant_fk') THEN
        ALTER TABLE stock_levels ADD CONSTRAINT stock_levels_tenant_fk 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stock_movements_tenant_fk') THEN
        ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_tenant_fk 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stock_adjustments_tenant_fk') THEN
        ALTER TABLE stock_adjustments ADD CONSTRAINT stock_adjustments_tenant_fk 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'serial_numbers_tenant_fk') THEN
        ALTER TABLE serial_numbers ADD CONSTRAINT serial_numbers_tenant_fk 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'batch_numbers_tenant_fk') THEN
        ALTER TABLE batch_numbers ADD CONSTRAINT batch_numbers_tenant_fk 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Make tenant_id NOT NULL after data migration (commented out - run manually after migrating data)
-- ALTER TABLE warehouses ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE stock_locations ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE stock_levels ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE stock_movements ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE stock_adjustments ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE serial_numbers ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE batch_numbers ALTER COLUMN tenant_id SET NOT NULL;

