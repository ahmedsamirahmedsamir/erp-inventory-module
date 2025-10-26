-- Down migration for inventory module
-- Drop all inventory module tables in reverse order

DROP TABLE IF EXISTS inventory_adjustments CASCADE;
DROP TABLE IF EXISTS inventory_transfers CASCADE;
DROP TABLE IF EXISTS inventory_counts CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;

