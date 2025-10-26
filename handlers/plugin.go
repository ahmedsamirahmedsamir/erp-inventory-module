package main

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/jmoiron/sqlx"
	sdk "github.com/linearbits/erp-backend/pkg/module-sdk"
	"go.uber.org/zap"
)

// InventoryPlugin implements the ModulePlugin interface
type InventoryPlugin struct {
	db      *sqlx.DB
	logger  *zap.Logger
	handler *InventoryHandler
}

// NewInventoryPlugin creates a new plugin instance
func NewInventoryPlugin() sdk.ModulePlugin {
	return &InventoryPlugin{}
}

// Initialize initializes the plugin
func (p *InventoryPlugin) Initialize(db *sqlx.DB, logger *zap.Logger) error {
	p.db = db
	p.logger = logger
	p.handler = NewInventoryHandler(db, logger)
	p.logger.Info("Inventory module initialized")
	return nil
}

// GetModuleCode returns the module code
func (p *InventoryPlugin) GetModuleCode() string {
	return "inventory"
}

// GetModuleVersion returns the module version
func (p *InventoryPlugin) GetModuleVersion() string {
	return "1.0.0"
}

// Cleanup performs cleanup
func (p *InventoryPlugin) Cleanup() error {
	p.logger.Info("Cleaning up inventory module")
	return nil
}

// GetHandler returns a handler function for a given route and method
func (p *InventoryPlugin) GetHandler(route string, method string) (http.HandlerFunc, error) {
	route = strings.TrimPrefix(route, "/")
	method = strings.ToUpper(method)

	handlers := map[string]http.HandlerFunc{
		"GET /products":         p.handler.GetProducts,
		"POST /products":        p.handler.CreateProduct,
		"GET /products/{id}":    p.handler.GetProduct,
		"PUT /products/{id}":    p.handler.UpdateProduct,
		"DELETE /products/{id}": p.handler.DeleteProduct,
		"GET /stock-levels":     p.handler.GetStockLevels,
		"GET /categories":       p.handler.GetCategories,
		"POST /categories":      p.handler.CreateCategory,
	}

	key := method + " " + route
	if handler, ok := handlers[key]; ok {
		return handler, nil
	}

	for pattern, handler := range handlers {
		if matchRoute(pattern, key) {
			return handler, nil
		}
	}

	return nil, fmt.Errorf("handler not found for route: %s %s", method, route)
}

func matchRoute(pattern, actual string) bool {
	pp := strings.Split(pattern, " ")
	ap := strings.Split(actual, " ")

	if len(pp) != 2 || len(ap) != 2 || pp[0] != ap[0] {
		return false
	}

	pPath := strings.Split(pp[1], "/")
	aPath := strings.Split(ap[1], "/")

	if len(pPath) != len(aPath) {
		return false
	}

	for i := range pPath {
		if pPath[i] != aPath[i] && !(strings.HasPrefix(pPath[i], "{") && strings.HasSuffix(pPath[i], "}")) {
			return false
		}
	}

	return true
}

// Handler is the exported symbol
var Handler = NewInventoryPlugin
