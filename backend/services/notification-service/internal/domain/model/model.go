package model

import "time"

type Notification struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Channel   string    `json:"channel"`
	Payload   string    `json:"payload"`
	CreatedAt time.Time `json:"created_at"`
}
