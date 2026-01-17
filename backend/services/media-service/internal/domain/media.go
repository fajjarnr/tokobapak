package domain

import (
	"time"

	"github.com/google/uuid"
)

type MediaType string

const (
	TypeImage MediaType = "image"
	TypeVideo MediaType = "video"
)

type Media struct {
	ID          uuid.UUID `json:"id"`
	FileName    string    `json:"fileName"`
	OriginalName string   `json:"originalName"`
	MimeType    string    `json:"mimeType"`
	Size        int64     `json:"size"`
	Type        MediaType `json:"type"`
	URL         string    `json:"url"`
	ThumbnailURL string   `json:"thumbnailUrl,omitempty"`
	Width       int       `json:"width,omitempty"`
	Height      int       `json:"height,omitempty"`
	OwnerID     string    `json:"ownerId"`
	OwnerType   string    `json:"ownerType"` // product, user, review
	CreatedAt   time.Time `json:"createdAt"`
}

type UploadResponse struct {
	ID           uuid.UUID `json:"id"`
	URL          string    `json:"url"`
	ThumbnailURL string    `json:"thumbnailUrl,omitempty"`
	FileName     string    `json:"fileName"`
	MimeType     string    `json:"mimeType"`
	Size         int64     `json:"size"`
}
