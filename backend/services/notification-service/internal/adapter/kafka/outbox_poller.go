package kafka

import (
	"context"
	"time"

	"github.com/segmentio/kafka-go"
)

const TopicPaymentCompleted = "tokobapak.payment.completed.v1"


type Consumer struct {
	reader *kafka.Reader
}

func NewConsumer(brokers []string, topic, groupID string) *Consumer {
	return &Consumer{reader: kafka.NewReader(kafka.ReaderConfig{Brokers: brokers, Topic: topic, GroupID: groupID})}
}

func (c *Consumer) Consume(ctx context.Context, handler func(topic string, payload []byte) error) error {
	for {
		m, err := c.reader.FetchMessage(ctx)
		if err != nil {
			if ctx.Err() != nil { return ctx.Err() }
			time.Sleep(time.Second)
			continue
		}
		if err := handler(m.Topic, m.Value); err != nil {
			// on fail, could publish to .dlq
		}
		_ = c.reader.CommitMessages(ctx, m)
	}
}

// OutboxPoller kept for compat (notification also has outbox table per ADR)
type OutboxPoller struct{ tick time.Duration }

func NewOutboxPoller() *OutboxPoller { return &OutboxPoller{tick: 5 * time.Second} }

func (o *OutboxPoller) Start(ctx context.Context) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(o.tick):
		}
	}
}
