package http

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/tokobapak/payment-service/internal/application/service"
	"github.com/tokobapak/payment-service/internal/domain/model"
)

func NewRouter(svc *service.Service) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok","service":"payment-service"}`))
	})
	r.Get("/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
	r.Post("/v1/payments", handleCreate(svc))
	r.Post("/api/v1/payments", handleCreate(svc))
	r.Post("/v1/payments/callback", handleCallback(svc))
	r.Post("/api/v1/payments/callback", handleCallback(svc))
	r.Get("/v1/payments/{id}", handleGet(svc))
	r.Get("/api/v1/payments/{id}", handleGet(svc))
	return r
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Idempotency-Key, X-Request-ID, X-SIGNATURE, X-TIMESTAMP")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func handleCreate(svc *service.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if svc == nil {
			http.Error(w, `{"code":"SERVICE_UNAVAILABLE"}`, http.StatusServiceUnavailable)
			return
		}
		idem := r.Header.Get("X-Idempotency-Key")
		if idem == "" {
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"code": "IDEMPOTENCY_KEY_REQUIRED"})
			return
		}
		var req struct {
			OrderID string `json:"order_id"`
			Amount  int64  `json:"amount"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"code":"BAD_REQUEST"}`, http.StatusBadRequest)
			return
		}
		p, err := svc.CreatePayment(r.Context(), req.OrderID, req.Amount, idem)
		if err != nil {
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"code": "BAD_REQUEST", "detail": err.Error()})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(p)
	}
}

func handleCallback(svc *service.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if svc == nil {
			w.WriteHeader(http.StatusOK)
			return
		}
		var req struct {
			OrderID     string `json:"order_id"`
			PayURef     string `json:"payu_reference"`
			Status      string `json:"status"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"code":"BAD_REQUEST"}`, http.StatusBadRequest)
			return
		}
		status := model.PaymentStatus(req.Status)
		if status == "" {
			status = model.PaymentCompleted
		}
		if err := svc.Callback(r.Context(), req.OrderID, req.PayURef, status); err != nil {
			// idempotent: return 200 even if already processed
			w.WriteHeader(http.StatusOK)
			_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	}
}

func handleGet(svc *service.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if svc == nil {
			http.Error(w, `{"code":"NOT_FOUND"}`, http.StatusNotFound)
			return
		}
		id := chi.URLParam(r, "id")
		p, err := svc.GetPayment(r.Context(), id)
		if err != nil {
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{"code": "NOT_FOUND"})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(p)
	}
}
