package http

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/tokobapak/product-service/internal/application/service"
	"github.com/tokobapak/product-service/internal/domain/model"
)

func NewRouter(svc *service.Service) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok","service":"product-service"}`))
	})
	r.Get("/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
	r.Get("/v1/products", handleList(svc))
	r.Get("/v1/products/{id}", handleGet(svc))
	r.Post("/v1/products", handleCreate(svc))
	r.Get("/api/v1/products", handleList(svc))
	r.Get("/api/v1/products/{id}", handleGet(svc))
	r.Post("/api/v1/products", handleCreate(svc))
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

func handleList(svc *service.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if svc == nil {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"data": []*model.Product{}, "total": 0, "page": 0, "pageSize": 0})
			return
		}
		limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
		if limit == 0 {
			limit, _ = strconv.Atoi(r.URL.Query().Get("pageSize"))
		}
		offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
		page, _ := strconv.Atoi(r.URL.Query().Get("page"))
		if page > 0 && offset == 0 {
			offset = (page - 1) * limit
		}
		products, err := svc.List(r.Context(), limit, offset)
		if err != nil {
			http.Error(w, `{"type":"about:blank","title":"internal","code":"INTERNAL"}`, http.StatusInternalServerError)
			return
		}
		if products == nil {
			products = []*model.Product{}
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"data": products,
			"total": len(products),
			"page": page,
			"pageSize": limit,
		})
	}
}

func handleGet(svc *service.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if svc == nil {
			http.Error(w, `{"code":"NOT_FOUND"}`, http.StatusNotFound)
			return
		}
		id := chi.URLParam(r, "id")
		p, err := svc.GetByID(r.Context(), id)
		if err != nil {
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{"type": "about:blank", "title": "not found", "code": "NOT_FOUND"})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(p)
	}
}

func handleCreate(svc *service.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if svc == nil {
			http.Error(w, `{"code":"SERVICE_UNAVAILABLE"}`, http.StatusServiceUnavailable)
			return
		}
		var p model.Product
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, `{"code":"BAD_REQUEST"}`, http.StatusBadRequest)
			return
		}
		if err := svc.Create(r.Context(), &p); err != nil {
			http.Error(w, `{"code":"BAD_REQUEST"}`, http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(p)
	}
}
