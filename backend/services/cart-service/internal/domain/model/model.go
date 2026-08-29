package model

import "time"

type CartItem struct {
	ProductID string `json:"product_id"`
	Qty       int64  `json:"qty"`
	Price     int64  `json:"price"`
}

type Cart struct {
	UserID    string     `json:"user_id"`
	Items     []CartItem `json:"items"`
	UpdatedAt time.Time  `json:"updated_at"`
}
