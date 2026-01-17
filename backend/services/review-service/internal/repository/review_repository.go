package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tokobapak/review-service/internal/domain"
)

type ReviewRepository struct {
	db *pgxpool.Pool
}

func NewReviewRepository(db *pgxpool.Pool) *ReviewRepository {
	return &ReviewRepository{db: db}
}

func (r *ReviewRepository) Create(ctx context.Context, review *domain.Review) error {
	query := `
		INSERT INTO reviews (id, product_id, user_id, order_id, rating, title, content, image_urls, verified, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	review.ID = uuid.New()
	review.CreatedAt = time.Now()
	review.UpdatedAt = time.Now()
	review.Verified = true // For now, assume all reviews are from verified purchases

	_, err := r.db.Exec(ctx, query,
		review.ID,
		review.ProductID,
		review.UserID,
		review.OrderID,
		review.Rating,
		review.Title,
		review.Content,
		review.ImageURLs,
		review.Verified,
		review.CreatedAt,
		review.UpdatedAt,
	)
	return err
}

func (r *ReviewRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Review, error) {
	query := `
		SELECT id, product_id, user_id, order_id, rating, title, content, image_urls, verified, helpful, created_at, updated_at
		FROM reviews WHERE id = $1
	`
	var review domain.Review
	err := r.db.QueryRow(ctx, query, id).Scan(
		&review.ID,
		&review.ProductID,
		&review.UserID,
		&review.OrderID,
		&review.Rating,
		&review.Title,
		&review.Content,
		&review.ImageURLs,
		&review.Verified,
		&review.Helpful,
		&review.CreatedAt,
		&review.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *ReviewRepository) GetByProductID(ctx context.Context, productID uuid.UUID, limit, offset int) ([]*domain.Review, error) {
	query := `
		SELECT id, product_id, user_id, order_id, rating, title, content, image_urls, verified, helpful, created_at, updated_at
		FROM reviews WHERE product_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.Query(ctx, query, productID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []*domain.Review
	for rows.Next() {
		var review domain.Review
		if err := rows.Scan(
			&review.ID,
			&review.ProductID,
			&review.UserID,
			&review.OrderID,
			&review.Rating,
			&review.Title,
			&review.Content,
			&review.ImageURLs,
			&review.Verified,
			&review.Helpful,
			&review.CreatedAt,
			&review.UpdatedAt,
		); err != nil {
			return nil, err
		}
		reviews = append(reviews, &review)
	}
	return reviews, nil
}

func (r *ReviewRepository) GetStats(ctx context.Context, productID uuid.UUID) (*domain.ReviewStats, error) {
	query := `
		SELECT 
			COALESCE(AVG(rating), 0) as avg_rating,
			COUNT(*) as total_reviews,
			COUNT(*) FILTER (WHERE rating = 1) as rating_1,
			COUNT(*) FILTER (WHERE rating = 2) as rating_2,
			COUNT(*) FILTER (WHERE rating = 3) as rating_3,
			COUNT(*) FILTER (WHERE rating = 4) as rating_4,
			COUNT(*) FILTER (WHERE rating = 5) as rating_5
		FROM reviews WHERE product_id = $1
	`
	var avgRating float64
	var totalReviews, r1, r2, r3, r4, r5 int
	
	err := r.db.QueryRow(ctx, query, productID).Scan(
		&avgRating, &totalReviews, &r1, &r2, &r3, &r4, &r5,
	)
	if err != nil && err != pgx.ErrNoRows {
		return nil, err
	}

	return &domain.ReviewStats{
		ProductID:     productID,
		AverageRating: avgRating,
		TotalReviews:  totalReviews,
		RatingCounts: map[int]int{
			1: r1, 2: r2, 3: r3, 4: r4, 5: r5,
		},
	}, nil
}

func (r *ReviewRepository) Update(ctx context.Context, id uuid.UUID, req *domain.UpdateReviewRequest) error {
	query := `
		UPDATE reviews 
		SET rating = COALESCE(NULLIF($1, 0), rating),
		    title = COALESCE(NULLIF($2, ''), title),
		    content = COALESCE(NULLIF($3, ''), content),
		    updated_at = $4
		WHERE id = $5
	`
	_, err := r.db.Exec(ctx, query, req.Rating, req.Title, req.Content, time.Now(), id)
	return err
}

func (r *ReviewRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM reviews WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *ReviewRepository) IncrementHelpful(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE reviews SET helpful = helpful + 1 WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
