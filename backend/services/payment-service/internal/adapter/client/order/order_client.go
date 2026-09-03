package order

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/tokobapak/payment-service/internal/domain/model"
)

// Client validates order existence + total via order-service (hexagonal adapter).
type Client struct {
	baseURL string
	http    *http.Client
}

func New(baseURL string) *Client {
	if baseURL == "" {
		baseURL = os.Getenv("ORDER_SERVICE_URL")
		if baseURL == "" {
			baseURL = os.Getenv("ORDER_BASE_URL")
		}
	}
	return &Client{baseURL: baseURL, http: &http.Client{Timeout: 5 * time.Second}}
}

func (c *Client) Total(ctx context.Context, orderID string) (int64, error) {
	if c.baseURL == "" {
		return 0, model.ErrNotFound
	}
	for _, p := range []string{"/v1/orders/", "/api/v1/orders/"} {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+p+orderID, nil)
		if err != nil {
			continue
		}
		resp, err := c.http.Do(req)
		if err != nil {
			continue
		}
		var out struct {
			Total int64 `json:"total"`
		}
		errCode := resp.StatusCode
		_ = json.NewDecoder(resp.Body).Decode(&out)
		resp.Body.Close()
		if errCode == http.StatusOK {
			return out.Total, nil
		}
		if errCode == http.StatusNotFound {
			return 0, model.ErrNotFound
		}
	}
	return 0, fmt.Errorf("order %s not found", orderID)
}
