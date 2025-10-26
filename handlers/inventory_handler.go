package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	sdk "github.com/linearbits/erp-backend/pkg/module-sdk"
	"github.com/go-chi/chi/v5"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

// InventoryHandler handles all inventory-related HTTP requests
type InventoryHandler struct {
	db     *sqlx.DB
	logger *zap.Logger
}

// NewInventoryHandler creates a new inventory handler
func NewInventoryHandler(db *sqlx.DB, logger *zap.Logger) *InventoryHandler {
	return &InventoryHandler{db: db, logger: logger}
}

// GetProducts retrieves all products
func (h *InventoryHandler) GetProducts(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	categoryID := r.URL.Query().Get("category_id")

	qb := sdk.NewQueryBuilder("SELECT * FROM products WHERE is_active = true")
	if search != "" {
		qb.AddCondition("(name ILIKE $%d OR sku ILIKE $%d)", "%"+search+"%")
	}
	qb.AddOptionalCondition("category_id = $%d", categoryID)

	query, args := qb.Build()
	query += " ORDER BY name LIMIT 50"

	var products []Product
	if err := h.db.Select(&products, query, args...); err != nil {
		h.logger.Error("Failed to fetch products", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to fetch products")
		return
	}

	sdk.WriteSuccess(w, map[string]interface{}{
		"products": products,
		"count":    len(products),
	})
}

// GetProduct retrieves a single product
func (h *InventoryHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		sdk.WriteBadRequest(w, "Invalid product ID")
		return
	}

	var product Product
	err = h.db.Get(&product, "SELECT * FROM products WHERE id = $1", id)
	if err != nil {
		if sdk.IsNoRows(err) {
			sdk.WriteNotFound(w, "Product not found")
			return
		}
		h.logger.Error("Failed to fetch product", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to fetch product")
		return
	}

	sdk.WriteSuccess(w, product)
}

// CreateProduct creates a new product
func (h *InventoryHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var req Product
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sdk.WriteBadRequest(w, "Invalid request body")
		return
	}

	if err := sdk.ValidateRequired(map[string]interface{}{
		"sku":  req.SKU,
		"name": req.Name,
	}); err != nil {
		sdk.WriteBadRequest(w, err.Error())
		return
	}

	query := `
		INSERT INTO products (sku, name, description, category_id, cost_price, selling_price, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, true)
		RETURNING id, created_at, updated_at
	`

	var id int
	var createdAt, updatedAt time.Time

	err := h.db.QueryRow(query, req.SKU, req.Name, req.Description, req.CategoryID,
		req.CostPrice, req.SellingPrice).Scan(&id, &createdAt, &updatedAt)

	if err != nil {
		h.logger.Error("Failed to create product", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to create product")
		return
	}

	sdk.WriteCreated(w, map[string]interface{}{
		"id":         id,
		"created_at": createdAt,
		"message":    "Product created successfully",
	})
}

// UpdateProduct updates a product
func (h *InventoryHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		sdk.WriteBadRequest(w, "Invalid product ID")
		return
	}

	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sdk.WriteBadRequest(w, "Invalid request body")
		return
	}

	// Dynamic update (similar to customer module)
	updates := []string{}
	args := []interface{}{}
	argIdx := 1

	allowedFields := map[string]bool{
		"name": true, "description": true, "cost_price": true,
		"selling_price": true, "is_active": true,
	}

	for key, val := range req {
		if allowedFields[key] {
			updates = append(updates, fmt.Sprintf("%s = $%d", key, argIdx))
			args = append(args, val)
			argIdx++
		}
	}

	if len(updates) == 0 {
		sdk.WriteBadRequest(w, "No fields to update")
		return
	}

	query := "UPDATE products SET " + updates[0]
	for i := 1; i < len(updates); i++ {
		query += ", " + updates[i]
	}
	query += fmt.Sprintf(" WHERE id = $%d", argIdx)
	args = append(args, id)

	_, err = h.db.Exec(query, args...)
	if err != nil {
		h.logger.Error("Failed to update product", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to update product")
		return
	}

	sdk.WriteSuccess(w, map[string]interface{}{"message": "Product updated successfully"})
}

// DeleteProduct soft deletes a product
func (h *InventoryHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		sdk.WriteBadRequest(w, "Invalid product ID")
		return
	}

	_, err = h.db.Exec("UPDATE products SET is_active = false WHERE id = $1", id)
	if err != nil {
		h.logger.Error("Failed to delete product", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to delete product")
		return
	}

	sdk.WriteSuccess(w, map[string]interface{}{"message": "Product deleted successfully"})
}

// GetStockLevels retrieves stock levels
func (h *InventoryHandler) GetStockLevels(w http.ResponseWriter, r *http.Request) {
	productID := r.URL.Query().Get("product_id")

	qb := sdk.NewQueryBuilder("SELECT * FROM stock_levels WHERE 1=1")
	qb.AddOptionalCondition("product_id = $%d", productID)

	query, args := qb.Build()
	query += " ORDER BY product_id, warehouse_id"

	var stockLevels []StockLevel
	if err := h.db.Select(&stockLevels, query, args...); err != nil {
		h.logger.Error("Failed to fetch stock levels", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to fetch stock levels")
		return
	}

	sdk.WriteSuccess(w, map[string]interface{}{
		"stock_levels": stockLevels,
		"count":        len(stockLevels),
	})
}

// GetCategories retrieves all product categories
func (h *InventoryHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	var categories []ProductCategory
	err := h.db.Select(&categories, "SELECT * FROM product_categories WHERE is_active = true ORDER BY name")
	if err != nil {
		h.logger.Error("Failed to fetch categories", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to fetch categories")
		return
	}

	sdk.WriteSuccess(w, map[string]interface{}{
		"categories": categories,
		"count":      len(categories),
	})
}

// CreateCategory creates a new product category
func (h *InventoryHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	var req ProductCategory
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sdk.WriteBadRequest(w, "Invalid request body")
		return
	}

	if err := sdk.MustNotBeEmpty("name", req.Name); err != nil {
		sdk.WriteBadRequest(w, err.Error())
		return
	}

	query := `
		INSERT INTO product_categories (name, description, parent_id, code)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`

	var id int
	var createdAt, updatedAt time.Time

	err := h.db.QueryRow(query, req.Name, req.Description, req.ParentID, req.Code).
		Scan(&id, &createdAt, &updatedAt)

	if err != nil {
		h.logger.Error("Failed to create category", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to create category")
		return
	}

	sdk.WriteCreated(w, map[string]interface{}{
		"id":         id,
		"created_at": createdAt,
		"message":    "Category created successfully",
	})
}

