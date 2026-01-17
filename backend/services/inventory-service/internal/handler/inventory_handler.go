package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/tokobapak/inventory-service/internal/domain"
	"github.com/tokobapak/inventory-service/internal/service"
)

type InventoryHandler struct {
	service *service.InventoryService
}

func NewInventoryHandler(svc *service.InventoryService) *InventoryHandler {
	return &InventoryHandler{service: svc}
}

func (h *InventoryHandler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1/inventory", func(r chi.Router) {
		r.Get("/products/{productId}", h.GetStock)
		r.Post("/products/{productId}/add", h.AddStock)
		r.Post("/products/{productId}/remove", h.RemoveStock)
		r.Post("/reserve", h.ReserveStock)
		r.Post("/release", h.ReleaseStock)
		r.Get("/products/{productId}/availability", h.CheckAvailability)
	})
}

func (h *InventoryHandler) GetStock(w http.ResponseWriter, r *http.Request) {
	productIDStr := chi.URLParam(r, "productId")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		http.Error(w, "Invalid Product ID", http.StatusBadRequest)
		return
	}

	inv, err := h.service.GetStock(r.Context(), productID)
	if err != nil {
		http.Error(w, "Inventory not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(inv)
}

func (h *InventoryHandler) AddStock(w http.ResponseWriter, r *http.Request) {
	productIDStr := chi.URLParam(r, "productId")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		http.Error(w, "Invalid Product ID", http.StatusBadRequest)
		return
	}

	var req domain.UpdateStockRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.AddStock(r.Context(), productID, req.Quantity, req.Reason); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *InventoryHandler) RemoveStock(w http.ResponseWriter, r *http.Request) {
	productIDStr := chi.URLParam(r, "productId")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		http.Error(w, "Invalid Product ID", http.StatusBadRequest)
		return
	}

	var req domain.UpdateStockRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.RemoveStock(r.Context(), productID, req.Quantity, req.Reason); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *InventoryHandler) ReserveStock(w http.ResponseWriter, r *http.Request) {
	var req domain.ReserveStockRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.ReserveStock(r.Context(), &req); err != nil {
		http.Error(w, "Insufficient stock", http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *InventoryHandler) ReleaseStock(w http.ResponseWriter, r *http.Request) {
	var req domain.ReserveStockRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.ReleaseStock(r.Context(), req.ProductID, req.Quantity, req.OrderID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *InventoryHandler) CheckAvailability(w http.ResponseWriter, r *http.Request) {
	productIDStr := chi.URLParam(r, "productId")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		http.Error(w, "Invalid Product ID", http.StatusBadRequest)
		return
	}

	qtyStr := r.URL.Query().Get("quantity")
	qty := 1
	if qtyStr != "" {
		var parseErr error
		qty, parseErr = parseInt(qtyStr)
		if parseErr != nil || qty < 1 {
			qty = 1
		}
	}

	available, err := h.service.CheckAvailability(r.Context(), productID, qty)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"available": available})
}

func parseInt(s string) (int, error) {
	var n int
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0, nil
		}
		n = n*10 + int(c-'0')
	}
	return n, nil
}
