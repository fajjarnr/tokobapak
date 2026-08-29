package postgres

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tokobapak/product-service/internal/domain/model"
)

type Postgres struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

func (p *Postgres) Create(ctx context.Context, prod *model.Product) error {
	q := `INSERT INTO products (id, name, description, price, stock, seller_id, category_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING created_at, updated_at`
	if prod.ID == "" {
		q = `INSERT INTO products (name, description, price, stock, seller_id, category_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, created_at, updated_at`
		var id string
		err := p.pool.QueryRow(ctx, q, prod.Name, prod.Description, prod.Price, prod.Stock, prod.SellerID, prod.CategoryID).Scan(&id, &prod.CreatedAt, &prod.UpdatedAt)
		if err != nil {
			return err
		}
		prod.ID = id
		return nil
	}
	return p.pool.QueryRow(ctx, q, prod.ID, prod.Name, prod.Description, prod.Price, prod.Stock, prod.SellerID, prod.CategoryID).Scan(&prod.CreatedAt, &prod.UpdatedAt)
}

func (p *Postgres) GetByID(ctx context.Context, id string) (*model.Product, error) {
	q := `SELECT id, name, description, price, stock, seller_id, category_id, created_at, updated_at FROM products WHERE id=$1`
	row := p.pool.QueryRow(ctx, q, id)
	var prod model.Product
	if err := row.Scan(&prod.ID, &prod.Name, &prod.Description, &prod.Price, &prod.Stock, &prod.SellerID, &prod.CategoryID, &prod.CreatedAt, &prod.UpdatedAt); err != nil {
		return nil, err
	}
	return &prod, nil
}

func (p *Postgres) List(ctx context.Context, limit, offset int) ([]*model.Product, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	q := `SELECT id, name, description, price, stock, seller_id, category_id, created_at, updated_at FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2`
	rows, err := p.pool.Query(ctx, q, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Product
	for rows.Next() {
		var prod model.Product
		if err := rows.Scan(&prod.ID, &prod.Name, &prod.Description, &prod.Price, &prod.Stock, &prod.SellerID, &prod.CategoryID, &prod.CreatedAt, &prod.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, &prod)
	}
	return out, rows.Err()
}

func (p *Postgres) DecrementStock(ctx context.Context, id string, qty int64) error {
	q := `UPDATE products SET stock = stock - $2, updated_at = NOW() WHERE id=$1 AND stock >= $2`
	tag, err := p.pool.Exec(ctx, q, id, qty)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return model.ErrInsufficientStock
	}
	return nil
}
