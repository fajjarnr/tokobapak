package http

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/tokobapak/payment-service/internal/adapter/client/payu"
	"github.com/tokobapak/payment-service/internal/application/service"
	"github.com/tokobapak/payment-service/internal/domain/model"
)

// stub repo for callback idempotency
type stubPayRepo struct {
	updated bool
	calls   int
}

func (s *stubPayRepo) Create(ctx context.Context, p *model.Payment) error { return nil }
func (s *stubPayRepo) GetByOrderID(ctx context.Context, orderID string) (*model.Payment, error) {
	return &model.Payment{ID: "id1", OrderID: orderID}, nil
}
func (s *stubPayRepo) GetByIdempotencyKey(ctx context.Context, key string) (*model.Payment, error) {
	return nil, model.ErrNotFound
}
func (s *stubPayRepo) GetByID(ctx context.Context, id string) (*model.Payment, error) {
	return &model.Payment{ID: id}, nil
}
func (s *stubPayRepo) UpdateByOrderIDForCallback(ctx context.Context, orderID string, payuRef string, status model.PaymentStatus) error {
	s.calls++
	s.updated = true
	return nil
}

func TestCallbackSignatureVerification(t *testing.T) {
	secret := "test-secret-123"
	client := payu.New("http://payu-gateway:8080", secret)
	repo := &stubPayRepo{}
	svc := service.NewService(repo, client)
	handler := NewRouter(svc, client)

	bodyObj := map[string]string{"order_id": "order-123", "payu_reference": "payu-ref-123", "status": "COMPLETED"}
	bodyBytes, _ := json.Marshal(bodyObj)

	// case 1: no signature -> 401
	req1 := httptest.NewRequest("POST", "/v1/payments/callback", bytes.NewReader(bodyBytes))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	handler.ServeHTTP(w1, req1)
	if w1.Code != 401 {
		t.Fatalf("expected 401 without signature, got %d body %s", w1.Code, w1.Body.String())
	}

	// case 2: valid HMAC -> 200
	timestamp := time.Now().UTC().Format(time.RFC3339)
	payload := string(bodyBytes)
	sig := client.Sign(payload, timestamp)
	req2 := httptest.NewRequest("POST", "/v1/payments/callback", bytes.NewReader(bodyBytes))
	req2.Header.Set("Content-Type", "application/json")
	req2.Header.Set("X-SIGNATURE", sig)
	req2.Header.Set("X-TIMESTAMP", timestamp)
	w2 := httptest.NewRecorder()
	handler.ServeHTTP(w2, req2)
	if w2.Code != 200 {
		t.Fatalf("expected 200 with valid signature, got %d body %s", w2.Code, w2.Body.String())
	}
	if !repo.updated {
		t.Error("expected repo updated on valid callback")
	}

	// case 3: replay same request -> still 200 idempotent
	req3 := httptest.NewRequest("POST", "/v1/payments/callback", bytes.NewReader(bodyBytes))
	req3.Header.Set("Content-Type", "application/json")
	req3.Header.Set("X-SIGNATURE", sig)
	req3.Header.Set("X-TIMESTAMP", timestamp)
	w3 := httptest.NewRecorder()
	handler.ServeHTTP(w3, req3)
	if w3.Code != 200 {
		t.Fatalf("expected 200 on replay, got %d", w3.Code)
	}
	if repo.calls != 2 {
		t.Errorf("expected repo calls 2 after replay, got %d", repo.calls)
	}

	// case 4: invalid signature -> 401
	req4 := httptest.NewRequest("POST", "/v1/payments/callback", bytes.NewReader(bodyBytes))
	req4.Header.Set("Content-Type", "application/json")
	req4.Header.Set("X-SIGNATURE", "invalid")
	req4.Header.Set("X-TIMESTAMP", timestamp)
	w4 := httptest.NewRecorder()
	handler.ServeHTTP(w4, req4)
	if w4.Code != 401 {
		t.Fatalf("expected 401 with invalid signature, got %d", w4.Code)
	}
}
