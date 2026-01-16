package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/tokobapak/catalog-service/internal/domain"
)

type postgresCategoryRepo struct {
	DB *sql.DB
}

func NewPostgresCategoryRepository(db *sql.DB) domain.CategoryRepository {
	return &postgresCategoryRepo{
		DB: db,
	}
}

func (p *postgresCategoryRepo) fetch(ctx context.Context, query string, args ...interface{}) ([]domain.Category, error) {
	rows, err := p.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.Category
	for rows.Next() {
		var t domain.Category
		err = rows.Scan(
			&t.ID,
			&t.Name,
			&t.Slug,
			&t.Description,
			&t.ParentID,
			&t.ImageURL,
			&t.IconURL,
			&t.DisplayOrder,
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

func (p *postgresCategoryRepo) Fetch(ctx context.Context, cursor string, num int64) ([]domain.Category, string, error) {
	query := `SELECT id, name, slug, description, parent_id, image_url, icon_url, display_order, is_active, created_at, updated_at 
			  FROM categories WHERE created_at > $1 ORDER BY created_at LIMIT $2`

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

func (p *postgresCategoryRepo) GetByID(ctx context.Context, id string) (domain.Category, error) {
	query := `SELECT id, name, slug, description, parent_id, image_url, icon_url, display_order, is_active, created_at, updated_at
			  FROM categories WHERE id = $1`

	list, err := p.fetch(ctx, query, id)
	if err != nil {
		return domain.Category{}, err
	}

	if len(list) > 0 {
		return list[0], nil
	}

	return domain.Category{}, domain.ErrNotFound
}

func (p *postgresCategoryRepo) GetBySlug(ctx context.Context, slug string) (domain.Category, error) {
	query := `SELECT id, name, slug, description, parent_id, image_url, icon_url, display_order, is_active, created_at, updated_at
			  FROM categories WHERE slug = $1`

	list, err := p.fetch(ctx, query, slug)
	if err != nil {
		return domain.Category{}, err
	}

	if len(list) > 0 {
		return list[0], nil
	}

	return domain.Category{}, domain.ErrNotFound
}

func (p *postgresCategoryRepo) GetByParentID(ctx context.Context, parentID *string) ([]domain.Category, error) {
	var query string
	var args []interface{}

	if parentID == nil {
		query = `SELECT id, name, slug, description, parent_id, image_url, icon_url, display_order, is_active, created_at, updated_at
				 FROM categories WHERE parent_id IS NULL ORDER BY display_order ASC`
	} else {
		query = `SELECT id, name, slug, description, parent_id, image_url, icon_url, display_order, is_active, created_at, updated_at
				 FROM categories WHERE parent_id = $1 ORDER BY display_order ASC`
		args = append(args, parentID)
	}

	return p.fetch(ctx, query, args...)
}

func (p *postgresCategoryRepo) Store(ctx context.Context, c *domain.Category) error {
	query := `INSERT INTO categories (id, name, slug, description, parent_id, image_url, icon_url, display_order, is_active, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	
	stmt, err := p.DB.PrepareContext(ctx, query)
	if err != nil {
		return err
	}

	_, err = stmt.ExecContext(ctx, c.ID, c.Name, c.Slug, c.Description, c.ParentID, c.ImageURL, c.IconURL, c.DisplayOrder, c.IsActive, c.CreatedAt, c.UpdatedAt)
	if err != nil {
		return err
	}

	return nil
}

func (p *postgresCategoryRepo) Update(ctx context.Context, c *domain.Category) error {
	query := `UPDATE categories SET name=$2, slug=$3, description=$4, parent_id=$5, image_url=$6, icon_url=$7, display_order=$8, is_active=$9, updated_at=$10
			  WHERE id=$1`

	stmt, err := p.DB.PrepareContext(ctx, query)
	if err != nil {
		return err
	}

	_, err = stmt.ExecContext(ctx, c.ID, c.Name, c.Slug, c.Description, c.ParentID, c.ImageURL, c.IconURL, c.DisplayOrder, c.IsActive, c.UpdatedAt)
	if err != nil {
		return err
	}

	return nil
}

func (p *postgresCategoryRepo) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM categories WHERE id = $1`

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
