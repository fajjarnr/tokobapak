package kafka

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/segmentio/kafka-go"
)

// OutboxPoller polls outbox table every 5s with SELECT FOR UPDATE SKIP LOCKED
// and publishes to kafka topic tokobapak.<domain>.<event>.v1, DLQ on fail: topic+".dlq"
type OutboxPoller struct {
	db     *pgxpool.Pool
	writer *kafka.Writer
	tick   time.Duration
}

func NewOutboxPoller(db *pgxpool.Pool, brokers []string) *OutboxPoller {
	return &OutboxPoller{
		db: db,
		writer: &kafka.Writer{Addr: kafka.TCP(brokers...), Balancer: &kafka.LeastBytes{}},
		tick: 5 * time.Second,
	}
}

func (o *OutboxPoller) Start(ctx context.Context) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(o.tick):
			if o.db == nil {
				continue
			}
			rows, err := o.db.Query(ctx, `SELECT id, topic, payload FROM outbox ORDER BY created_at LIMIT 10 FOR UPDATE SKIP LOCKED`)
			if err != nil {
				continue
			}
			for rows.Next() {
				var id, topic string
				var payload []byte
				if err := rows.Scan(&id, &topic, &payload); err != nil {
					continue
				}
				err = o.writer.WriteMessages(ctx, kafka.Message{Topic: topic, Value: payload})
				if err != nil {
					_ = o.writer.WriteMessages(ctx, kafka.Message{Topic: topic + ".dlq", Value: payload})
					continue
				}
				_, _ = o.db.Exec(ctx, `DELETE FROM outbox WHERE id = $1`, id)
			}
			rows.Close()
		}
	}
}
