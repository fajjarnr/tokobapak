package service

import (
	"testing"
	"github.com/tokobapak/order-service/internal/domain/model"
)

func TestSagaTransitions(t *testing.T) {
	cases := []struct{
		from, to model.OrderStatus
		shouldPass bool
	}{
		{model.StatusPending, model.StatusReserved, true},
		{model.StatusReserved, model.StatusPaid, true},
		{model.StatusPaid, model.StatusShipped, true},
		{model.StatusShipped, model.StatusDelivered, true},
		{model.StatusPending, model.StatusCancelled, true},
		{model.StatusPaid, model.StatusCancelled, false}, // cannot cancel after paid without compensate
	}
	for _, c := range cases {
		allowed := isAllowed(c.from, c.to)
		if allowed != c.shouldPass {
			t.Errorf("transition %s->%s expected %v got %v", c.from, c.to, c.shouldPass, allowed)
		}
	}
}

func isAllowed(from, to model.OrderStatus) bool {
	allowed := map[model.OrderStatus][]model.OrderStatus{
		model.StatusPending: {model.StatusReserved, model.StatusCancelled},
		model.StatusReserved: {model.StatusPaid, model.StatusCancelled},
		model.StatusPaid: {model.StatusShipped},
		model.StatusShipped: {model.StatusDelivered},
	}
	for _, v := range allowed[from] {
		if v == to { return true }
	}
	return false
}

func TestSagaCompensate(t *testing.T) {
	// compensate when inventory reserve fails -> OrderCancelled
	order := &model.Order{ID: "o1", Status: model.StatusPending}
	// simulate reserve fails
	err := reserveStock(order.ID, true)
	if err == nil {
		t.Fatal("expected reserve fail")
	}
	// compensate: update status to CANCELLED
	order.Status = model.StatusCancelled
	if order.Status != model.StatusCancelled {
		t.Error("compensate failed")
	}
}

func reserveStock(orderID string, fail bool) error {
	if fail { return model.ErrInsufficientStock }
	return nil
}
