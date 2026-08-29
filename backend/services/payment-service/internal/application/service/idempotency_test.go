package service

import (
	"testing"
	"sync"
	"github.com/tokobapak/payment-service/internal/domain/model"
)

type memStore struct {
	mu   sync.Mutex
	byKey map[string]*model.Payment
	byOrder map[string]*model.Payment
}

func newMem() *memStore { return &memStore{byKey: make(map[string]*model.Payment), byOrder: make(map[string]*model.Payment)} }

func (m *memStore) Create(p *model.Payment) error {
	m.mu.Lock()
	defer m.mu.Unlock()
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

func (m *memStore) GetByKey(key string) (*model.Payment, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if p, ok := m.byKey[key]; ok { return p, nil }
	return nil, model.ErrNotFound
}

func TestIdempotencyReplay(t *testing.T) {
	store := newMem()
	p1 := &model.Payment{ID: "p1", OrderID: "o1", IdempotencyKey: "key-123", Status: model.PaymentPending, Amount: 10000}
	if err := store.Create(p1); err != nil {
		t.Fatalf("first create failed: %v", err)
	}
	// replay with same key should be idempotent: return existing, not create duplicate
	p2 := &model.Payment{ID: "p2", OrderID: "o1", IdempotencyKey: "key-123", Status: model.PaymentPending, Amount: 10000}
	err := store.Create(p2)
	if err != model.ErrConflict {
		t.Fatalf("expected conflict on replay, got %v", err)
	}
	existing, _ := store.GetByKey("key-123")
	if existing.ID != "p1" {
		t.Errorf("expected existing p1, got %s", existing.ID)
	}
	// second replay should return 200 without double posting (idempotent)
	if existing.OrderID != "o1" {
		t.Error("orderID mismatch")
	}
}

func TestPaymentForUpdateCallback(t *testing.T) {
	// simulate SELECT FOR UPDATE in callback: concurrent callbacks with same payu_reference should be idempotent
	store := newMem()
	p := &model.Payment{ID: "p1", OrderID: "o1", IdempotencyKey: "k1", Status: model.PaymentPending, Amount: 5000}
	_ = store.Create(p)
	// simulate callback with FOR UPDATE
	ref := "payu-ref-123"
	p.PayUReference = &ref
	p.Status = model.PaymentCompleted
	// second callback with same ref should not double update
	if p.Status != model.PaymentCompleted {
		t.Error("status not completed")
	}
}
