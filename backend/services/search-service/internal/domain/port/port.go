package port

import (
	"context"
	"github.com/tokobapak/search-service/internal/domain/model"
)

type SearchRepository interface {
	Index(ctx context.Context, doc model.ProductDoc) error
	Search(ctx context.Context, p model.SearchParams) ([]model.ProductDoc, error)
}
