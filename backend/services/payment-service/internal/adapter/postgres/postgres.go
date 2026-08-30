package postgres

import (
	"context"
	"encoding/json"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tokobapak/payment-service/internal/domain/model"
)

type Postgres struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

func (p *Postgres) Create(ctx context.Context, pay *model.Payment) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	q := `INSERT INTO payments (order_id, payu_reference, idempotency_key, status, amount) VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at, updated_at`
	if err := tx.QueryRow(ctx, q, pay.OrderID, pay.PayUReference, pay.IdempotencyKey, pay.Status, pay.Amount).Scan(&pay.ID, &pay.CreatedAt, &pay.UpdatedAt); err != nil {
		return err
	}
	payloadMap := map[string]interface{}{"order_id": pay.OrderID, "payu_reference": deref(pay.PayUReference), "amount": pay.Amount, "status": string(pay.Status)}
	payloadBytes, _ := json.Marshal(payloadMap)
	_, err = tx.Exec(ctx, `INSERT INTO outbox (topic, payload) VALUES ($1,$2)`, "tokobapak.payment.completed.v1", payloadBytes)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}


func (p *Postgres) GetByOrderID(ctx context.Context, orderID string) (*model.Payment, error) {
	q := `SELECT id, order_id, payu_reference, idempotency_key, status, amount, created_at, updated_at FROM payments WHERE order_id=$1`
	var pay model.Payment
	err := p.pool.QueryRow(ctx, q, orderID).Scan(&pay.ID, &pay.OrderID, &pay.PayUReference, &pay.IdempotencyKey, &pay.Status, &pay.Amount, &pay.CreatedAt, &pay.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &pay, nil
}

func (p *Postgres) GetByIdempotencyKey(ctx context.Context, key string) (*model.Payment, error) {
	q := `SELECT id, order_id, payu_reference, idempotency_key, status, amount, created_at, updated_at FROM payments WHERE idempotency_key=$1`
	var pay model.Payment
	err := p.pool.QueryRow(ctx, q, key).Scan(&pay.ID, &pay.OrderID, &pay.PayUReference, &pay.IdempotencyKey, &pay.Status, &pay.Amount, &pay.CreatedAt, &pay.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &pay, nil
}

func (p *Postgres) GetByID(ctx context.Context, id string) (*model.Payment, error) {
	q := `SELECT id, order_id, payu_reference, idempotency_key, status, amount, created_at, updated_at FROM payments WHERE id=$1`
	var pay model.Payment
	err := p.pool.QueryRow(ctx, q, id).Scan(&pay.ID, &pay.OrderID, &pay.PayUReference, &pay.IdempotencyKey, &pay.Status, &pay.Amount, &pay.CreatedAt, &pay.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &pay, nil
}

func (p *Postgres) UpdateStatusForCallback(ctx context.Context, payuRef string, status model.PaymentStatus) error {
	q := `UPDATE payments SET status=$2, payu_reference=$1, updated_at=NOW() WHERE payu_reference=$1`
	// For callback idempotency, use SELECT FOR UPDATE then update
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	var existing string
	err = tx.QueryRow(ctx, `SELECT id FROM payments WHERE payu_reference=$1 FOR UPDATE`, payuRef).Scan(&existing)
	if err != nil {
		// if not found by payu_reference, try to update by payu_reference anyway (first callback)
		_, err = tx.Exec(ctx, `UPDATE payments SET status=$1, updated_at=NOW() WHERE payu_reference=$2`, status, payuRef)
		if err != nil {
			return err
		}
		return tx.Commit(ctx)
	}
	_, err = tx.Exec(ctx, q, payuRef, status)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (p *Postgres) UpdateByOrderIDForCallback(ctx context.Context, orderID string, payuRef string, status model.PaymentStatus) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	var id string
	err = tx.QueryRow(ctx, `SELECT id FROM payments WHERE order_id=$1 FOR UPDATE`, orderID).Scan(&id)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `UPDATE payments SET payu_reference=$1, status=$2, updated_at=NOW() WHERE id=$3`, payuRef, status, id)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}
