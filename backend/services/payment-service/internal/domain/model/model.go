package model

import "time"

type PaymentStatus string

const (
	PaymentPending   PaymentStatus = "PENDING"
	PaymentCompleted PaymentStatus = "COMPLETED"
	PaymentFailed    PaymentStatus = "FAILED"
)

type Payment struct {
	ID             string        `json:"id"`
	OrderID        string        `json:"order_id"`
	PayUReference  *string       `json:"payu_reference,omitempty"`
	IdempotencyKey string        `json:"idempotency_key"`
	Status         PaymentStatus `json:"status"`
	Amount         int64         `json:"amount"`
	CreatedAt      time.Time     `json:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at"`
}
