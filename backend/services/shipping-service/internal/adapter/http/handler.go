package http

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Shipment struct {
	OrderID string `json:"order_id"`
	Address string `json:"address"`
	Cost    int64  `json:"cost"`
	Status  string `json:"status"`
}

var (
	mu        sync.Mutex
	shipments = make(map[string]Shipment)
)

func NewRouter() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok","service":"shipping-service"}`))
	})
	r.Get("/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
	r.Post("/v1/shipping", handleCreateShipment)
	r.Post("/api/v1/shipping", handleCreateShipment)
	r.Get("/v1/shipping/{orderId}", handleGetShipment)
	r.Get("/api/v1/shipping/{orderId}", handleGetShipment)
	return r
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func handleCreateShipment(w http.ResponseWriter, r *http.Request) {
	var req struct {
		OrderID string `json:"order_id"`
		OrderId string `json:"orderId"`
		Address string `json:"address"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"code":"BAD_REQUEST"}`, http.StatusBadRequest)
		return
	}
	oid := req.OrderID
	if oid == "" {
		oid = req.OrderId
	}
	if oid == "" {
		http.Error(w, `{"code":"BAD_REQUEST","detail":"order_id required"}`, http.StatusBadRequest)
		return
	}
	addr := req.Address
	if addr == "" {
		addr = "Jl. Default No. 1"
	}
	mu.Lock()
	defer mu.Unlock()
	// cost flat 10000, outbox would be tokobapak.shipment.created.v1
	s := Shipment{OrderID: oid, Address: addr, Cost: 10000, Status: "PENDING"}
	shipments[oid] = s
	// TODO: insert outbox tokobapak.shipment.created.v1 via kafka poller when DB wired
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(s)
}

func handleGetShipment(w http.ResponseWriter, r *http.Request) {
	oid := chi.URLParam(r, "orderId")
	if oid == "" {
		oid = chi.URLParam(r, "orderID")
	}
	mu.Lock()
	s, ok := shipments[oid]
	mu.Unlock()
	if !ok {
		w.Header().Set("Content-Type", "application/problem+json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"code": "NOT_FOUND"})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(s)
}
