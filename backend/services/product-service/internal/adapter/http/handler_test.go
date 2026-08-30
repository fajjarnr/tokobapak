package http

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/tokobapak/product-service/internal/application/service"
	"github.com/tokobapak/product-service/internal/domain/model"
	"context"
)

type stubRepo struct{ calls int }

func (s *stubRepo) Create(ctx context.Context, p *model.Product) error { s.calls++; return nil }
func (s *stubRepo) GetByID(ctx context.Context, id string) (*model.Product, error) {
	return nil, model.ErrNotFound
}
func (s *stubRepo) List(ctx context.Context, limit, offset int) ([]*model.Product, error) {
	return nil, nil
}
func (s *stubRepo) DecrementStock(ctx context.Context, id string, qty int64) error { return nil }

func TestHandleCreateValidation(t *testing.T) {
	repo := &stubRepo{}
	svc := service.NewService(repo)
	h := NewRouter(svc)
	cases := []struct {
		body string
		want int
		code string
	}{
		{`{"name":"","price":-1,"stock":5}`, 400, "BAD_REQUEST"},
		{`{"name":"kopi","price":-1,"stock":5}`, 400, "BAD_REQUEST"},
		{`{"name":"kopi","price":10000,"stock":-1}`, 400, "BAD_REQUEST"},
		{`{"name":"kopi","price":10000,"stock":5}`, 201, ""},
	}
	for _, tc := range cases {
		req := httptest.NewRequest("POST", "/v1/products", bytes.NewBufferString(tc.body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		h.ServeHTTP(w, req)
		if w.Code != tc.want {
			t.Fatalf("body %s want %d got %d body %s", tc.body, tc.want, w.Code, w.Body.String())
		}
		if tc.want == 400 {
			var body map[string]interface{}
			if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
				t.Fatalf("json decode %v", err)
			}
			if body["code"] != tc.code {
				t.Errorf("code want %s got %v", tc.code, body["code"])
			}
			if w.Header().Get("Content-Type") != "application/problem+json" {
				t.Errorf("content-type want problem+json got %s", w.Header().Get("Content-Type"))
			}
		}
		if tc.body == `{"name":"kopi","price":10000,"stock":5}` && w.Code != 201 {
			t.Error("valid should be 201")
		}
		// also test api prefix
		req2 := httptest.NewRequest("POST", "/api/v1/products", bytes.NewBufferString(tc.body))
		req2.Header.Set("Content-Type", "application/json")
		w2 := httptest.NewRecorder()
		h.ServeHTTP(w2, req2)
		if w2.Code != tc.want {
			t.Fatalf("api prefix body %s want %d got %d", tc.body, tc.want, w2.Code)
		}
	}
	_ = http.StatusOK
}
