# ERP Inventory Module

A comprehensive inventory management module for the LinearBits ERP system.

## Features

- Product catalog with categories and variants
- Stock level tracking with low stock alerts
- Warehouse and location management
- Stock movements and adjustments
- Serial/batch tracking
- Cycle counts and audits

## Installation

This module can be installed through the LinearBits ERP Marketplace or directly from GitHub.

## Usage

Once installed, the Inventory module will be available in your ERP navigation menu under "Inventory".

## API Endpoints

- `GET /api/v1/inventory/products` - List products
- `POST /api/v1/inventory/products` - Create product
- `PUT /api/v1/inventory/products/{id}` - Update product
- `DELETE /api/v1/inventory/products/{id}` - Delete product
- `GET /api/v1/inventory/categories` - List categories
- `GET /api/v1/inventory/stock` - Stock levels
- `POST /api/v1/inventory/stock/adjust` - Stock adjustment

## Permissions

- `inventory.products.view` - View products
- `inventory.products.create` - Create products
- `inventory.products.edit` - Edit products
- `inventory.products.delete` - Delete products
- `inventory.stock.view` - View stock levels
- `inventory.stock.adjust` - Adjust stock levels

## Database Tables

This module uses the following database tables:
- `products` - Product catalog
- `product_categories` - Product categories
- `warehouses` - Warehouse locations
- `stock_locations` - Stock locations within warehouses
- `stock_movements` - Stock movement history
- `stock_adjustments` - Stock adjustments

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the LinearBits team.
