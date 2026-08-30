package http

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/tokobapak/order-service/internal/application/service"
	"github.com/tokobapak/order-service/internal/domain/model"
)

func NewRouter(svc *service.Service) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok","service":"order-service"}`))
	})
	r.Get("/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
	r.Post("/v1/orders", handleCreateOrder(svc))
	r.Post("/api/v1/orders", handleCreateOrder(svc))
	r.Get("/v1/orders/{id}", handleGetOrder(svc))
	r.Get("/api/v1/orders/{id}", handleGetOrder(svc))
	return r
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Idempotency-Key, X-Request-ID")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func handleCreateOrder(svc *service.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if svc == nil {
			http.Error(w, `{"code":"SERVICE_UNAVAILABLE"}`, http.StatusServiceUnavailable)
			return
		}
		idem := r.Header.Get("X-Idempotency-Key")
		if idem == "" {
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"type": "about:blank", "title": "Bad Request", "status": "400", "code": "IDEMPOTENCY_KEY_REQUIRED"})
			return
		}
		var req struct {
			UserID string `json:"user_id"`
			Items  []struct {
				ProductID string `json:"product_id"`
				ProductId string `json:"productId"`
				Qty       int64  `json:"qty"`
				Quantity  int64  `json:"quantity"`
				Price     int64  `json:"price"`
			} `json:"items"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"code": "BAD_REQUEST"})
			return
		}
		if len(req.Items) == 0 {
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"code": "BAD_REQUEST", "detail": "items required"})
			return
		}
		var items []model.OrderItem
		for _, it := range req.Items {
			pid := it.ProductID
			if pid == "" {
				pid = it.ProductId
			}
			if pid == "" {
				pid = "00000000-0000-0000-0000-000000000002"
			}
			qty := it.Qty
			if qty == 0 {
				qty = it.Quantity
			}
			if qty == 0 {
				qty = 1
			}
			items = append(items, model.OrderItem{ProductID: pid, Qty: qty, Price: it.Price})
		}
		order, err := svc.CreateOrder(r.Context(), req.UserID, items, idem)
		if err != nil {
			if err == model.ErrInsufficientStock {
				w.Header().Set("Content-Type", "application/problem+json")
				w.WriteHeader(http.StatusConflict)
				_ = json.NewEncoder(w).Encode(map[string]string{"code": "INSUFFICIENT_STOCK"})
				return
			}
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"code": "BAD_REQUEST", "detail": err.Error()})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(order)
	}
}

func handleGetOrder(svc *service.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if svc == nil {
			http.Error(w, `{"code":"NOT_FOUND"}`, http.StatusNotFound)
			return
		}
		id := chi.URLParam(r, "id")
		order, err := svc.GetOrder(r.Context(), id)
		if err != nil {
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{"code": "NOT_FOUND"})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(order)
	}
}
