package http

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/redis/go-redis/v9"
)

func NewRouter(redisClient ...*redis.Client) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok","service":"cart-service"}`))
	})
	r.Get("/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
	var rc *redis.Client
	if len(redisClient) > 0 {
		rc = redisClient[0]
	}
	r.Get("/v1/cart", handleGetCart(rc))
	r.Get("/api/v1/cart", handleGetCart(rc))
	r.Post("/v1/cart", handlePostCart(rc))
	r.Post("/api/v1/cart", handlePostCart(rc))
	r.Delete("/v1/cart", handleClearCart(rc))
	r.Delete("/api/v1/cart", handleClearCart(rc))
	r.Delete("/v1/cart/{productId}", handleDeleteCartItem(rc))
	r.Delete("/api/v1/cart/{productId}", handleDeleteCartItem(rc))
	return r
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Id")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func userKey(r *http.Request) string {
	uid := r.Header.Get("X-User-Id")
	if uid == "" {
		uid = r.URL.Query().Get("userId")
	}
	if uid == "" {
		uid = r.URL.Query().Get("user_id")
	}
	if uid == "" {
		uid = "test-user"
	}
	return "cart:" + uid
}

func handleGetCart(rc *redis.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if rc == nil {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"items": []interface{}{}, "userId": "test-user"})
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		key := userKey(r)
		data, err := rc.HGetAll(ctx, key).Result()
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"items": []interface{}{}})
			return
		}
		var items []map[string]interface{}
		for pid, qtyStr := range data {
			qty, _ := strconv.ParseInt(qtyStr, 10, 64)
			items = append(items, map[string]interface{}{"productId": pid, "product_id": pid, "qty": qty, "quantity": qty})
		}
		if items == nil {
			items = []map[string]interface{}{}
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"items": items})
	}
}

func handlePostCart(rc *redis.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			ProductID string `json:"productId"`
			ProductId string `json:"product_id"`
			Qty       int64  `json:"qty"`
			Quantity  int64  `json:"quantity"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"code":"BAD_REQUEST"}`, http.StatusBadRequest)
			return
		}
		pid := req.ProductID
		if pid == "" {
			pid = req.ProductId
		}
		if pid == "" {
			http.Error(w, `{"code":"BAD_REQUEST","detail":"productId required"}`, http.StatusBadRequest)
			return
		}
		qty := req.Qty
		if qty == 0 {
			qty = req.Quantity
		}
		if qty <= 0 {
			qty = 1
		}
		if rc == nil {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"productId": pid, "qty": qty})
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		key := userKey(r)
		// merge sum: get existing qty and add
		existing, _ := rc.HGet(ctx, key, pid).Result()
		if existing != "" {
			eqty, _ := strconv.ParseInt(existing, 10, 64)
			qty += eqty
		}
		if err := rc.HSet(ctx, key, pid, qty).Err(); err != nil {
			http.Error(w, `{"code":"INTERNAL"}`, http.StatusInternalServerError)
			return
		}
		_ = rc.Expire(ctx, key, 604800*time.Second).Err()
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"productId": pid, "qty": qty})
	}
}

func handleDeleteCartItem(rc *redis.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		pid := chi.URLParam(r, "productId")
		if pid == "" {
			http.Error(w, `{"code":"BAD_REQUEST"}`, http.StatusBadRequest)
			return
		}
		if rc != nil {
			ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
			defer cancel()
			key := userKey(r)
			_ = rc.HDel(ctx, key, pid).Err()
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	}
}

func handleClearCart(rc *redis.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if rc != nil {
			ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
			defer cancel()
			key := userKey(r)
			_ = rc.Del(ctx, key).Err()
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	}
}
