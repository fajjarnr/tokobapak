package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/tokobapak/review-service/internal/domain"
	"github.com/tokobapak/review-service/internal/repository"
)

type ReviewService struct {
	repo *repository.ReviewRepository
}

func NewReviewService(repo *repository.ReviewRepository) *ReviewService {
	return &ReviewService{repo: repo}
}

func (s *ReviewService) CreateReview(ctx context.Context, req *domain.CreateReviewRequest) (*domain.Review, error) {
	// Validate rating
	if req.Rating < 1 || req.Rating > 5 {
		req.Rating = 5 // Default to 5 if invalid
	}

	review := &domain.Review{
		ProductID: req.ProductID,
		UserID:    req.UserID,
		OrderID:   req.OrderID,
		Rating:    req.Rating,
		Title:     req.Title,
		Content:   req.Content,
		ImageURLs: req.ImageURLs,
	}

	if err := s.repo.Create(ctx, review); err != nil {
		return nil, err
	}
	return review, nil
}

func (s *ReviewService) GetReview(ctx context.Context, id uuid.UUID) (*domain.Review, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *ReviewService) GetProductReviews(ctx context.Context, productID uuid.UUID, page, pageSize int) ([]*domain.Review, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize
	return s.repo.GetByProductID(ctx, productID, pageSize, offset)
}

func (s *ReviewService) GetProductStats(ctx context.Context, productID uuid.UUID) (*domain.ReviewStats, error) {
	return s.repo.GetStats(ctx, productID)
}

func (s *ReviewService) UpdateReview(ctx context.Context, id uuid.UUID, req *domain.UpdateReviewRequest) error {
	return s.repo.Update(ctx, id, req)
}

func (s *ReviewService) DeleteReview(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *ReviewService) MarkHelpful(ctx context.Context, id uuid.UUID) error {
	return s.repo.IncrementHelpful(ctx, id)
}
