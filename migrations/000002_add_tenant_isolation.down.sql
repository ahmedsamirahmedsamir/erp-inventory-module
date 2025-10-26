-- Rollback tenant isolation from inventory module tables

-- Remove all foreign keys
ALTER TABLE warehouses DROP CONSTRAINT IF EXISTS warehouses_tenant_fk;
ALTER TABLE stock_locations DROP CONSTRAINT IF EXISTS stock_locations_tenant_fk;
ALTER TABLE stock_levels DROP CONSTRAINT IF EXISTS stock_levels_tenant_fk;
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_tenant_fk;
ALTER TABLE stock_adjustments DROP CONSTRAINT IF EXISTS stock_adjustments_tenant_fk;
ALTER TABLE serial_numbers DROP CONSTRAINT IF EXISTS serial_numbers_tenant_fk;
ALTER TABLE batch_numbers DROP CONSTRAINT IF EXISTS batch_numbers_tenant_fk;

-- Remove all indexes
DROP INDEX IF EXISTS idx_warehouses_tenant;
DROP INDEX IF EXISTS idx_stock_locations_tenant;
DROP INDEX IF EXISTS idx_stock_levels_tenant;
DROP INDEX IF EXISTS idx_stock_movements_tenant;
DROP INDEX IF EXISTS idx_stock_adjustments_tenant;
DROP INDEX IF EXISTS idx_serial_numbers_tenant;
DROP INDEX IF EXISTS idx_batch_numbers_tenant;

-- Restore original unique constraints
ALTER TABLE warehouses DROP CONSTRAINT IF EXISTS warehouses_tenant_code_unique;
ALTER TABLE warehouses ADD CONSTRAINT warehouses_code_key UNIQUE(code);

ALTER TABLE stock_locations DROP CONSTRAINT IF EXISTS stock_locations_tenant_warehouse_code_unique;
ALTER TABLE stock_locations ADD CONSTRAINT stock_locations_warehouse_id_code_key UNIQUE(warehouse_id, code);

-- Remove tenant_id columns
ALTER TABLE warehouses DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE stock_locations DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE stock_levels DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE stock_movements DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE stock_adjustments DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE serial_numbers DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE batch_numbers DROP COLUMN IF EXISTS tenant_id;

