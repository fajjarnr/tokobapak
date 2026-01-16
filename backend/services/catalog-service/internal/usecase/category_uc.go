package usecase

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/tokobapak/catalog-service/internal/domain"
)

type categoryUsecase struct {
	categoryRepo   domain.CategoryRepository
	contextTimeout time.Duration
}

func NewCategoryUsecase(c domain.CategoryRepository, timeout time.Duration) domain.CategoryUsecase {
	return &categoryUsecase{
		categoryRepo:   c,
		contextTimeout: timeout,
	}
}

func (uc *categoryUsecase) Fetch(c context.Context, cursor string, num int64) ([]domain.Category, string, error) {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()

	if num == 0 {
		num = 10
	}

	return uc.categoryRepo.Fetch(ctx, cursor, num)
}

func (uc *categoryUsecase) GetByID(c context.Context, id string) (domain.Category, error) {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()
	return uc.categoryRepo.GetByID(ctx, id)
}

func (uc *categoryUsecase) GetBySlug(c context.Context, slug string) (domain.Category, error) {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()
	return uc.categoryRepo.GetBySlug(ctx, slug)
}

func (uc *categoryUsecase) GetTree(c context.Context) ([]domain.Category, error) {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()
	
	// Implementation for basic tree retrieval (fetching roots)
	// For full tree, recursive logic would be needed, here we simplify to getting roots
	return uc.categoryRepo.GetByParentID(ctx, nil)
}

func (uc *categoryUsecase) Store(c context.Context, m *domain.Category) error {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()

	existedCategory, _ := uc.categoryRepo.GetBySlug(ctx, m.Slug)
	if existedCategory.ID != "" {
		return domain.ErrConflict
	}

	m.ID = uuid.New().String()
	m.CreatedAt = time.Now()
	m.UpdatedAt = time.Now()

	return uc.categoryRepo.Store(ctx, m)
}

func (uc *categoryUsecase) Update(c context.Context, m *domain.Category) error {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()

	m.UpdatedAt = time.Now()
	return uc.categoryRepo.Update(ctx, m)
}

func (uc *categoryUsecase) Delete(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()
	return uc.categoryRepo.Delete(ctx, id)
}
