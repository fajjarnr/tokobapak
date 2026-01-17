package domain

import (
	"time"

	"github.com/google/uuid"
)

type Review struct {
	ID        uuid.UUID `json:"id"`
	ProductID uuid.UUID `json:"productId"`
	UserID    uuid.UUID `json:"userId"`
	OrderID   uuid.UUID `json:"orderId"`
	Rating    int       `json:"rating"` // 1-5 stars
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	ImageURLs []string  `json:"imageUrls,omitempty"`
	Verified  bool      `json:"verified"` // Verified purchase
	Helpful   int       `json:"helpful"`  // Helpful votes count
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CreateReviewRequest struct {
	ProductID uuid.UUID `json:"productId"`
	UserID    uuid.UUID `json:"userId"`
	OrderID   uuid.UUID `json:"orderId"`
	Rating    int       `json:"rating"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	ImageURLs []string  `json:"imageUrls,omitempty"`
}

type UpdateReviewRequest struct {
	Rating  int    `json:"rating,omitempty"`
	Title   string `json:"title,omitempty"`
	Content string `json:"content,omitempty"`
}

type ReviewStats struct {
	ProductID    uuid.UUID `json:"productId"`
	AverageRating float64   `json:"averageRating"`
	TotalReviews  int       `json:"totalReviews"`
	RatingCounts  map[int]int `json:"ratingCounts"` // count per star rating
}
