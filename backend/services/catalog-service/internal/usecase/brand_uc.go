package usecase

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/tokobapak/catalog-service/internal/domain"
)

type brandUsecase struct {
	brandRepo      domain.BrandRepository
	contextTimeout time.Duration
}

func NewBrandUsecase(b domain.BrandRepository, timeout time.Duration) domain.BrandUsecase {
	return &brandUsecase{
		brandRepo:      b,
		contextTimeout: timeout,
	}
}

func (uc *brandUsecase) Fetch(c context.Context, cursor string, num int64) ([]domain.Brand, string, error) {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()

	if num == 0 {
		num = 10
	}

	return uc.brandRepo.Fetch(ctx, cursor, num)
}

func (uc *brandUsecase) GetByID(c context.Context, id string) (domain.Brand, error) {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()
	return uc.brandRepo.GetByID(ctx, id)
}

func (uc *brandUsecase) GetBySlug(c context.Context, slug string) (domain.Brand, error) {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()
	return uc.brandRepo.GetBySlug(ctx, slug)
}

func (uc *brandUsecase) Store(c context.Context, m *domain.Brand) error {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()

	existedBrand, _ := uc.brandRepo.GetBySlug(ctx, m.Slug)
	if existedBrand.ID != "" {
		return domain.ErrConflict
	}

	m.ID = uuid.New().String()
	m.CreatedAt = time.Now()
	m.UpdatedAt = time.Now()

	return uc.brandRepo.Store(ctx, m)
}

func (uc *brandUsecase) Update(c context.Context, m *domain.Brand) error {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()

	m.UpdatedAt = time.Now()
	return uc.brandRepo.Update(ctx, m)
}

func (uc *brandUsecase) Delete(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, uc.contextTimeout)
	defer cancel()
	return uc.brandRepo.Delete(ctx, id)
}
