package service

import (
	"context"
	"testing"

	"github.com/tokobapak/payment-service/internal/domain/model"
)

func TestCreatePaymentOrderValidation(t *testing.T) {
	repo := newMemAdapter()
	svc := NewServiceNoPayU(repo).WithOrderValidator(func(ctx context.Context, id string) (int64, error) {
		if id == "missing" {
			return 0, model.ErrNotFound
		}
		return 10000, nil
	})
	if _, err := svc.CreatePayment(context.Background(), "missing", 10000, "k1"); err != model.ErrNotFound {
		t.Errorf("expected not found, got %v", err)
	}
	if _, err := svc.CreatePayment(context.Background(), "o1", 999, "k2"); err != model.ErrBadRequest {
		t.Errorf("expected bad request on amount mismatch, got %v", err)
	}
	p, err := svc.CreatePayment(context.Background(), "o1", 10000, "k3")
	if err != nil {
		t.Fatal(err)
	}
	if p.Status != model.PaymentPending {
		t.Errorf("expected PENDING, got %s", p.Status)
	}
	// idempotency replay same key returns existing
	p2, err := svc.CreatePayment(context.Background(), "o1", 10000, "k3")
	if err != nil {
		t.Fatal(err)
	}
	if p2.IdempotencyKey != "k3" {
		t.Errorf("idempotency broken")
	}
}

type memAdapter struct {
	byKey   map[string]*model.Payment
	byOrder map[string]*model.Payment
}

func newMemAdapter() *memAdapter {
	return &memAdapter{byKey: make(map[string]*model.Payment), byOrder: make(map[string]*model.Payment)}
}

func (m *memAdapter) Create(_ context.Context, p *model.Payment) error {
	if _, ok := m.byKey[p.IdempotencyKey]; ok {
		return model.ErrConflict
	}
	if _, ok := m.byOrder[p.OrderID]; ok {
		return model.ErrConflict
	}
	m.byKey[p.IdempotencyKey] = p
	m.byOrder[p.OrderID] = p
	return nil
}

func (m *memAdapter) GetByOrderID(_ context.Context, id string) (*model.Payment, error) {
	if p, ok := m.byOrder[id]; ok {
		return p, nil
	}
	return nil, model.ErrNotFound
}

func (m *memAdapter) GetByIdempotencyKey(_ context.Context, k string) (*model.Payment, error) {
	if p, ok := m.byKey[k]; ok {
		return p, nil
	}
	return nil, model.ErrNotFound
}

func (m *memAdapter) GetByID(_ context.Context, id string) (*model.Payment, error) {
	for _, p := range m.byKey {
		if p.ID == id {
			return p, nil
		}
	}
	return nil, model.ErrNotFound
}

func (m *memAdapter) UpdateByOrderIDForCallback(_ context.Context, orderID, payuRef string, s model.PaymentStatus) error {
	p, ok := m.byOrder[orderID]
	if !ok {
		return model.ErrNotFound
	}
	p.Status = s
	p.PayUReference = &payuRef
	return nil
}
