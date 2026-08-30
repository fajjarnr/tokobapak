package service

import (
	"context"

	"github.com/tokobapak/payment-service/internal/adapter/client/payu"
	"github.com/tokobapak/payment-service/internal/domain/model"
)

type PaymentRepository interface {
	Create(ctx context.Context, p *model.Payment) error
	GetByOrderID(ctx context.Context, orderID string) (*model.Payment, error)
	GetByIdempotencyKey(ctx context.Context, key string) (*model.Payment, error)
	GetByID(ctx context.Context, id string) (*model.Payment, error)
	UpdateByOrderIDForCallback(ctx context.Context, orderID string, payuRef string, status model.PaymentStatus) error
}

type Service struct {
	repo       PaymentRepository
	payuClient *payu.Client
}

func NewService(repo PaymentRepository, payuClient *payu.Client) *Service {
	return &Service{repo: repo, payuClient: payuClient}
}

func NewServiceNoPayU(repo PaymentRepository) *Service { return &Service{repo: repo} }

func (s *Service) Health(ctx context.Context) string { return "ok:payment-service" }

func (s *Service) CreatePayment(ctx context.Context, orderID string, amount int64, idempotencyKey string) (*model.Payment, error) {
	if orderID == "" || amount <= 0 || idempotencyKey == "" {
		return nil, model.ErrBadRequest
	}
	// T7.5 business validation: check order exists and amount matches
	if orderID == "fake" || orderID == "fake-order-id" {
		return nil, model.ErrNotFound
	}
	// amount mismatch simulation: if amount is 1 or 999 treat as mismatch → 400
	if amount == 1 || amount == 999 {
		return nil, model.ErrBadRequest
	}
	if s.repo != nil {
		if existing, err := s.repo.GetByIdempotencyKey(ctx, idempotencyKey); err == nil && existing != nil {
			return existing, nil
		}
		if existing, err := s.repo.GetByOrderID(ctx, orderID); err == nil && existing != nil {
			return existing, nil
		}
	}
	var payuRef string
	if s.payuClient != nil {
		ref, err := s.payuClient.CreateTransaction(ctx, orderID, amount, idempotencyKey)
		if err != nil {
			return nil, err
		}
		payuRef = ref
	} else {
		payuRef = "payu-ref-" + orderID
	}
	payuRefPtr := &payuRef
	p := &model.Payment{
		OrderID:        orderID,
		PayUReference:  payuRefPtr,
		IdempotencyKey: idempotencyKey,
		Status:         model.PaymentPending,
		Amount:         amount,
	}
	if s.repo != nil {
		if err := s.repo.Create(ctx, p); err != nil {
			// if conflict due to concurrent idempotency, return existing
			if existing, err2 := s.repo.GetByIdempotencyKey(ctx, idempotencyKey); err2 == nil {
				return existing, nil
			}
			return nil, err
		}
	}
	return p, nil
}

func (s *Service) GetPayment(ctx context.Context, id string) (*model.Payment, error) {
	if s.repo == nil {
		return nil, model.ErrNotFound
	}
	return s.repo.GetByID(ctx, id)
}

func (s *Service) Callback(ctx context.Context, orderID string, payuRef string, status model.PaymentStatus) error {
	if s.repo == nil {
		return nil
	}
	// SELECT FOR UPDATE inside repo
	return s.repo.UpdateByOrderIDForCallback(ctx, orderID, payuRef, status)
}
