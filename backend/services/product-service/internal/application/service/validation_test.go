package service

import (
	"context"
	"testing"

	"github.com/tokobapak/product-service/internal/domain/model"
)

type stubRepo struct {
	calls int
}

func (s *stubRepo) Create(ctx context.Context, p *model.Product) error { s.calls++; return nil }
func (s *stubRepo) GetByID(ctx context.Context, id string) (*model.Product, error) {
	return nil, model.ErrNotFound
}
func (s *stubRepo) List(ctx context.Context, limit, offset int) ([]*model.Product, error) {
	return nil, nil
}
func (s *stubRepo) DecrementStock(ctx context.Context, id string, qty int64) error { return nil }

func TestCreateValidation(t *testing.T) {
	repo := &stubRepo{}
	svc := NewService(repo)
	cases := []struct {
		name    string
		product model.Product
		wantErr bool
	}{
		{"empty name", model.Product{Name: "", Price: 10000, Stock: 5}, true},
		{"negative price", model.Product{Name: "kopi", Price: -1, Stock: 5}, true},
		{"negative stock", model.Product{Name: "kopi", Price: 10000, Stock: -1}, true},
		{"valid product", model.Product{Name: "kopi", Price: 0, Stock: 0}, false},
	}
	for _, tc := range cases {
		err := svc.Create(context.Background(), &tc.product)
		gotErr := err != nil
		if gotErr != tc.wantErr {
			t.Errorf("%s: expected err=%v got %v err=%v", tc.name, tc.wantErr, gotErr, err)
		}
		if err != nil && tc.wantErr && err != model.ErrBadRequest {
			t.Errorf("%s: expected ErrBadRequest got %v", tc.name, err)
		}
	}
	// valid case should have called repo once, invalid cases should not
	if repo.calls != 1 {
		t.Errorf("expected repo.Create called once for valid case, got %d", repo.calls)
	}
}
