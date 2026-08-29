package port

import "context"

type EventConsumer interface {
	Consume(ctx context.Context, topic string, handler func(payload []byte) error) error
}

type Notifier interface {
	Send(ctx context.Context, userID, channel, payload string) error
}
