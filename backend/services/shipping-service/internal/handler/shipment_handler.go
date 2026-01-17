package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/tokobapak/shipping-service/internal/domain"
	"github.com/tokobapak/shipping-service/internal/service"
)

type ShipmentHandler struct {
	service *service.ShipmentService
}

func NewShipmentHandler(svc *service.ShipmentService) *ShipmentHandler {
	return &ShipmentHandler{service: svc}
}

func (h *ShipmentHandler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1/shipments", func(r chi.Router) {
		r.Post("/", h.CreateShipment)
		r.Get("/{id}", h.GetShipment)
		r.Get("/order/{orderId}", h.GetShipmentByOrder)
		r.Patch("/{id}/status", h.UpdateStatus)
	})
}

func (h *ShipmentHandler) CreateShipment(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateShipmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	shipment, err := h.service.CreateShipment(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(shipment)
}

func (h *ShipmentHandler) GetShipment(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	shipment, err := h.service.GetShipment(r.Context(), id)
	if err != nil {
		http.Error(w, "Shipment not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(shipment)
}

func (h *ShipmentHandler) GetShipmentByOrder(w http.ResponseWriter, r *http.Request) {
	orderIDStr := chi.URLParam(r, "orderId")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		http.Error(w, "Invalid Order ID", http.StatusBadRequest)
		return
	}

	shipment, err := h.service.GetShipmentByOrder(r.Context(), orderID)
	if err != nil {
		http.Error(w, "Shipment not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(shipment)
}

func (h *ShipmentHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var req domain.UpdateShipmentStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateStatus(r.Context(), id, &req); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
