package redis

import (
	"context"
	"time"
	"github.com/redis/go-redis/v9"
)

type CartStore struct {
	c   *redis.Client
	ttl time.Duration
}

func New(addr string) *CartStore {
	return &CartStore{c: redis.NewClient(&redis.Options{Addr: addr}), ttl: 7 * 24 * time.Hour}
}

func (s *CartStore) Ping(ctx context.Context) error { return s.c.Ping(ctx).Err() }
