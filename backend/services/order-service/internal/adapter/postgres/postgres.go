package postgres

import (
	"context"
	"encoding/json"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tokobapak/order-service/internal/domain/model"
)

type Postgres struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

func (p *Postgres) Create(ctx context.Context, o *model.Order, items []model.OrderItem) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	// insert order
	var id string
	err = tx.QueryRow(ctx,
		`INSERT INTO orders (user_id, status, total, idempotency_key) VALUES ($1,$2,$3,$4) RETURNING id, created_at, updated_at`,
		o.UserID, o.Status, o.Total, o.IdempotencyKey).Scan(&id, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return err
	}
	o.ID = id
	// insert items
	for _, it := range items {
		_, err = tx.Exec(ctx,
			`INSERT INTO order_items (order_id, product_id, qty, price) VALUES ($1,$2,$3,$4)`,
			o.ID, it.ProductID, it.Qty, it.Price)
		if err != nil {
			return err
		}
	}
	// outbox
	payloadMap := map[string]interface{}{
		"order_id": o.ID,
		"user_id":  o.UserID,
		"total":    o.Total,
		"status":   o.Status,
		"items":    items,
	}
	payload, _ := json.Marshal(payloadMap)
	_, err = tx.Exec(ctx, `INSERT INTO outbox (topic, payload) VALUES ($1,$2)`, "tokobapak.order.created.v1", payload)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (p *Postgres) GetByID(ctx context.Context, id string) (*model.Order, error) {
	q := `SELECT id, user_id, status, total, COALESCE(idempotency_key,''), created_at, updated_at FROM orders WHERE id=$1`
	var o model.Order
	err := p.pool.QueryRow(ctx, q, id).Scan(&o.ID, &o.UserID, &o.Status, &o.Total, &o.IdempotencyKey, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &o, nil
}

func (p *Postgres) GetByIdempotencyKey(ctx context.Context, key string) (*model.Order, error) {
	q := `SELECT id, user_id, status, total, COALESCE(idempotency_key,''), created_at, updated_at FROM orders WHERE idempotency_key=$1`
	var o model.Order
	err := p.pool.QueryRow(ctx, q, key).Scan(&o.ID, &o.UserID, &o.Status, &o.Total, &o.IdempotencyKey, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &o, nil
}

func (p *Postgres) UpdateStatus(ctx context.Context, id string, status model.OrderStatus) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	var existing string
	err = tx.QueryRow(ctx, `SELECT id FROM orders WHERE id=$1 FOR UPDATE`, id).Scan(&existing)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2`, status, id)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}
