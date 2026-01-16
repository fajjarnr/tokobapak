package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/tokobapak/catalog-service/internal/domain"
)

type postgresBrandRepo struct {
	DB *sql.DB
}

func NewPostgresBrandRepository(db *sql.DB) domain.BrandRepository {
	return &postgresBrandRepo{
		DB: db,
	}
}

func (p *postgresBrandRepo) fetch(ctx context.Context, query string, args ...interface{}) ([]domain.Brand, error) {
	rows, err := p.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.Brand
	for rows.Next() {
		var t domain.Brand
		err = rows.Scan(
			&t.ID,
			&t.Name,
			&t.Slug,
			&t.LogoURL,
			&t.IsActive,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		result = append(result, t)
	}

	return result, nil
}

func (p *postgresBrandRepo) Fetch(ctx context.Context, cursor string, num int64) ([]domain.Brand, string, error) {
	query := `SELECT id, name, slug, logo_url, is_active, created_at, updated_at 
			  FROM brands WHERE created_at > $1 ORDER BY created_at LIMIT $2`

	decodedCursor, err := time.Parse(time.RFC3339, cursor)
	if err != nil && cursor != "" {
		return nil, "", domain.ErrBadParamInput
	}
	if cursor == "" {
		decodedCursor = time.Time{}
	}

	res, err := p.fetch(ctx, query, decodedCursor, num)
	if err != nil {
		return nil, "", err
	}

	nextCursor := ""
	if len(res) > 0 {
		nextCursor = res[len(res)-1].CreatedAt.Format(time.RFC3339)
	}

	return res, nextCursor, nil
}

func (p *postgresBrandRepo) GetByID(ctx context.Context, id string) (domain.Brand, error) {
	query := `SELECT id, name, slug, logo_url, is_active, created_at, updated_at
			  FROM brands WHERE id = $1`

	list, err := p.fetch(ctx, query, id)
	if err != nil {
		return domain.Brand{}, err
	}

	if len(list) > 0 {
		return list[0], nil
	}

	return domain.Brand{}, domain.ErrNotFound
}

func (p *postgresBrandRepo) GetBySlug(ctx context.Context, slug string) (domain.Brand, error) {
	query := `SELECT id, name, slug, logo_url, is_active, created_at, updated_at
			  FROM brands WHERE slug = $1`

	list, err := p.fetch(ctx, query, slug)
	if err != nil {
		return domain.Brand{}, err
	}

	if len(list) > 0 {
		return list[0], nil
	}

	return domain.Brand{}, domain.ErrNotFound
}

func (p *postgresBrandRepo) Store(ctx context.Context, b *domain.Brand) error {
	query := `INSERT INTO brands (id, name, slug, logo_url, is_active, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7)`
	
	stmt, err := p.DB.PrepareContext(ctx, query)
	if err != nil {
		return err
	}

	_, err = stmt.ExecContext(ctx, b.ID, b.Name, b.Slug, b.LogoURL, b.IsActive, b.CreatedAt, b.UpdatedAt)
	if err != nil {
		return err
	}

	return nil
}

func (p *postgresBrandRepo) Update(ctx context.Context, b *domain.Brand) error {
	query := `UPDATE brands SET name=$2, slug=$3, logo_url=$4, is_active=$5, updated_at=$6
			  WHERE id=$1`

	stmt, err := p.DB.PrepareContext(ctx, query)
	if err != nil {
		return err
	}

	_, err = stmt.ExecContext(ctx, b.ID, b.Name, b.Slug, b.LogoURL, b.IsActive, b.UpdatedAt)
	if err != nil {
		return err
	}

	return nil
}

func (p *postgresBrandRepo) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM brands WHERE id = $1`

	stmt, err := p.DB.PrepareContext(ctx, query)
	if err != nil {
		return err
	}

	res, err := stmt.ExecContext(ctx, id)
	if err != nil {
		return err
	}

	rowsAfected, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAfected != 1 {
		return fmt.Errorf("weird behavior: total affected: %d", rowsAfected)
	}

	return nil
}
