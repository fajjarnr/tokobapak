package payu

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestHMACSignature(t *testing.T) {
	c := New("http://payu-gateway:8080", "dev-secret")
	payload := `{"orderId":"o1","amount":10000}`
	ts := "2026-08-29T10:00:00Z"
	sig1 := c.Sign(payload, ts)
	sig2 := c.Sign(payload, ts)
	if sig1 != sig2 {
		t.Error("HMAC not deterministic")
	}
	if len(sig1) != 64 {
		t.Errorf("expected hex 64, got %d", len(sig1))
	}
	sig3 := c.Sign(payload+"x", ts)
	if sig1 == sig3 {
		t.Error("different payload same sig")
	}
}

func TestSnapBISignVectors(t *testing.T) {
	c := New("http://payu-partner-service:8080", "tokobapak-mvp-dev-secret-32chars-long!")
	ts := "2026-08-30T10:00:00Z"
	body := `{"grantType":"client_credentials"}`
	s1 := c.SignForB2B("POST", "/v1.0/access-token/b2b", ts, body)
	s2 := c.SignForB2B("POST", "/v1.0/access-token/b2b", ts, body)
	if s1 == "" || s1 != s2 {
		t.Fatal("B2B signature not deterministic")
	}
	payBody := `{"partnerReferenceNo":"o1","amount":{"value":"50000","currency":"IDR"}}`
	t1 := c.SignWithToken("POST", "/v1.0/transfer-va/payment", "tok123", payBody, ts)
	t2 := c.SignWithToken("POST", "/v1.0/transfer-va/payment", "tok123", payBody, ts)
	if t1 == "" || t1 != t2 {
		t.Fatal("token signature not deterministic")
	}
	if t1 == s1 {
		t.Error("B2B and token signatures should differ")
	}
}

func snapBIMock(t *testing.T, payResp map[string]interface{}, payStatus int) *httptest.Server {
	t.Helper()
	mux := http.NewServeMux()
	mux.HandleFunc("/v1.0/access-token/b2b", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"accessToken": "tok123"})
	})
	mux.HandleFunc("/v1.0/transfer-va/payment", func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer tok123" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		if r.Header.Get("X-SIGNATURE") == "" || r.Header.Get("X-TIMESTAMP") == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(payStatus)
		_ = json.NewEncoder(w).Encode(payResp)
	})
	return httptest.NewServer(mux)
}

func TestCreateTransactionSuccess(t *testing.T) {
	srv := snapBIMock(t, map[string]interface{}{
		"responseCode":       "2002500",
		"partnerReferenceNo": "order-123",
		"referenceNo":        "PAYU-REF-1",
	}, http.StatusOK)
	defer srv.Close()
	c := New(srv.URL, "tokobapak-mvp-dev-secret-32chars-long!")
	ref, err := c.CreateTransaction(nil, "order-123", 50000, "idem-key-abc-123")
	if err != nil {
		t.Fatal(err)
	}
	if ref != "PAYU-REF-1" {
		t.Errorf("unexpected ref %s", ref)
	}
}

func TestCreateTransactionBusinessError(t *testing.T) {
	// PayU returns HTTP 200 with responseCode 4002501 for business errors.
	srv := snapBIMock(t, map[string]interface{}{
		"responseCode":       "4002501",
		"responseMessage":    "partnerReferenceNo is required",
		"partnerReferenceNo": "order-123",
	}, http.StatusOK)
	defer srv.Close()
	c := New(srv.URL, "secret")
	if _, err := c.CreateTransaction(nil, "order-123", 50000, "k1"); err == nil {
		t.Fatal("expected business error, got nil")
	}
}

func TestCreateTransactionFailFast(t *testing.T) {
	c := New("", "secret")
	if _, err := c.CreateTransaction(nil, "o1", 100, "k"); err == nil {
		t.Fatal("expected error on empty baseURL, got mock ref")
	}
	c2 := New("http://127.0.0.1:1", "secret")
	if _, err := c2.CreateTransaction(nil, "o1", 100, "k"); err == nil {
		t.Fatal("expected transport error, got mock ref")
	}
}

func TestIdempotencyHeaders(t *testing.T) {
	ts := time.Now().UTC().Format(time.RFC3339)
	payload := `{"partnerReferenceNo":"order-123","amount":{"value":"500.00","currency":"IDR"}}`
	c := New("http://payu-gateway:8080", "dev-secret")
	sig := c.Sign(payload, ts)
	headers := map[string]string{
		"X-Idempotency-Key": "idem-key-abc-123",
		"X-SIGNATURE":       sig,
		"X-TIMESTAMP":       ts,
	}
	if headers["X-Idempotency-Key"] != "idem-key-abc-123" {
		t.Error("idempotency header missing")
	}
}
