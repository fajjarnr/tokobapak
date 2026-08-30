package http

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/tokobapak/order-service/internal/application/service"
	"github.com/tokobapak/order-service/internal/domain/model"
	"context"
)

type stubOrderRepo struct {
	orders map[string]*model.Order
}

func newStub() *stubOrderRepo { return &stubOrderRepo{orders: make(map[string]*model.Order)} }

func (s *stubOrderRepo) Create(ctx context.Context, o *model.Order, items []model.OrderItem) error {
	if _, ok := s.orders[o.IdempotencyKey]; ok {
		return model.ErrConflict
	}
	if o.ID == "" {
		o.ID = "order-" + o.IdempotencyKey
	}
	s.orders[o.IdempotencyKey] = o
	// also index by ID for GetByID
	s.orders[o.ID] = o
	return nil
}
func (s *stubOrderRepo) GetByID(ctx context.Context, id string) (*model.Order, error) {
	if o, ok := s.orders[id]; ok {
		return o, nil
	}
	return nil, model.ErrNotFound
}
func (s *stubOrderRepo) GetByIdempotencyKey(ctx context.Context, key string) (*model.Order, error) {
	if o, ok := s.orders[key]; ok {
		return o, nil
	}
	return nil, model.ErrNotFound
}
func (s *stubOrderRepo) UpdateStatus(ctx context.Context, id string, status model.OrderStatus) error {
	if o, ok := s.orders[id]; ok {
		o.Status = status
		return nil
	}
	return model.ErrNotFound
}

func TestCreateOrderHandler(t *testing.T) {
	repo := newStub()
	svc := service.NewService(repo, nil)
	h := NewRouter(svc)

	body := `{"items":[{"productId":"00000000-0000-0000-0000-000000000002","qty":2,"price":50000}]}`
	// missing idempotency -> 400
	req1 := httptest.NewRequest("POST", "/v1/orders", bytes.NewBufferString(body))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	h.ServeHTTP(w1, req1)
	if w1.Code != 400 {
		t.Fatalf("expected 400 without idem, got %d %s", w1.Code, w1.Body.String())
	}
	// with idempotency -> 201
	req2 := httptest.NewRequest("POST", "/v1/orders", bytes.NewBufferString(body))
	req2.Header.Set("Content-Type", "application/json")
	req2.Header.Set("X-Idempotency-Key", "idem-123")
	w2 := httptest.NewRecorder()
	h.ServeHTTP(w2, req2)
	if w2.Code != 201 {
		t.Fatalf("expected 201, got %d %s", w2.Code, w2.Body.String())
	}
	var order model.Order
	if err := json.Unmarshal(w2.Body.Bytes(), &order); err != nil {
		t.Fatal(err)
	}
	if order.Total != 100000 {
		t.Errorf("expected total 100000, got %d", order.Total)
	}
	if order.ID == "" {
		t.Error("expected order ID")
	}
	// replay same idempotency -> 201 same ID
	req3 := httptest.NewRequest("POST", "/v1/orders", bytes.NewBufferString(body))
	req3.Header.Set("Content-Type", "application/json")
	req3.Header.Set("X-Idempotency-Key", "idem-123")
	w3 := httptest.NewRecorder()
	h.ServeHTTP(w3, req3)
	if w3.Code != 201 {
		t.Fatalf("expected 201 on replay, got %d", w3.Code)
	}
	var order2 model.Order
	_ = json.Unmarshal(w3.Body.Bytes(), &order2)
	if order2.ID != order.ID {
		t.Errorf("expected same ID on replay %s vs %s", order2.ID, order.ID)
	}
	// verify GET
	req4 := httptest.NewRequest("GET", "/v1/orders/"+order.ID, nil)
	w4 := httptest.NewRecorder()
	h.ServeHTTP(w4, req4)
	if w4.Code != 200 {
		t.Fatalf("expected 200 GET, got %d", w4.Code)
	}
	_ = http.StatusOK
}
