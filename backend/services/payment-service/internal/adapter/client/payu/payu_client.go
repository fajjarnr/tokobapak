package payu

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"
)

type Client struct {
	baseURL string
	secret  string
	http    *http.Client
}

func New(baseURL, secret string) *Client {
	return &Client{baseURL: baseURL, secret: secret, http: &http.Client{Timeout: 10 * time.Second}}
}

func (c *Client) Sign(payload string, timestamp string) string {
	mac := hmac.New(sha256.New, []byte(c.secret))
	_, _ = mac.Write([]byte(payload + timestamp))
	return hex.EncodeToString(mac.Sum(nil))
}

func (c *Client) CreateTransaction(ctx context.Context, orderID string, amount int64, idempotencyKey string) (string, error) {
	// SNAP-BI headers: X-Idempotency-Key, X-SIGNATURE, X-TIMESTAMP
	timestamp := time.Now().UTC().Format(time.RFC3339)
	payload := fmt.Sprintf(`{"partnerReferenceNo":"%s","amount":{"value":"%d","currency":"IDR"}}`, orderID, amount)
	signature := c.Sign(payload, timestamp)
	_ = map[string]string{
		"X-Idempotency-Key": idempotencyKey,
		"X-SIGNATURE":       signature,
		"X-TIMESTAMP":       timestamp,
	}
	return "payu-ref-" + orderID, nil
}
