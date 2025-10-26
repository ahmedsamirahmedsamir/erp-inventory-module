package main

import "time"

// Product represents an inventory product
type Product struct {
	ID            int       `json:"id"`
	SKU           string    `json:"sku"`
	Name          string    `json:"name"`
	Description   *string   `json:"description"`
	CategoryID    *int      `json:"category_id"`
	Brand         *string   `json:"brand"`
	Model         *string   `json:"model"`
	UnitOfMeasure string    `json:"unit_of_measure"`
	Weight        *float64  `json:"weight"`
	Dimensions    *string   `json:"dimensions"`
	CostPrice     *float64  `json:"cost_price"`
	SellingPrice  *float64  `json:"selling_price"`
	MinStockLevel *int      `json:"min_stock_level"`
	MaxStockLevel *int      `json:"max_stock_level"`
	ReorderPoint  *int      `json:"reorder_point"`
	IsActive      bool      `json:"is_active"`
	IsSerialized  bool      `json:"is_serialized"`
	IsBatched     bool      `json:"is_batched"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ProductCategory represents a product category
type ProductCategory struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	ParentID    *int      `json:"parent_id"`
	Code        *string   `json:"code"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// StockLevel represents stock level for a product
type StockLevel struct {
	ID                int        `json:"id"`
	ProductID         int        `json:"product_id"`
	WarehouseID       int        `json:"warehouse_id"`
	LocationID        *int       `json:"location_id"`
	QuantityOnHand    int        `json:"quantity_on_hand"`
	QuantityReserved  int        `json:"quantity_reserved"`
	QuantityAvailable int        `json:"quantity_available"`
	LastCountedAt     *time.Time `json:"last_counted_at"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

// StockMovement represents inventory movement
type StockMovement struct {
	ID            int       `json:"id"`
	ProductID     int       `json:"product_id"`
	WarehouseID   int       `json:"warehouse_id"`
	LocationID    *int      `json:"location_id"`
	MovementType  string    `json:"movement_type"`
	Quantity      int       `json:"quantity"`
	ReferenceType *string   `json:"reference_type"`
	ReferenceID   *int      `json:"reference_id"`
	Reason        *string   `json:"reason"`
	Notes         *string   `json:"notes"`
	UserID        int       `json:"user_id"`
	CreatedAt     time.Time `json:"created_at"`
}
