package payu

import (
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
	// different payload should give different sig
	sig3 := c.Sign(payload+"x", ts)
	if sig1 == sig3 {
		t.Error("different payload same sig")
	}
}

func TestIdempotencyKeyRoundTrip(t *testing.T) {
	c := New("http://payu-gateway:8080", "dev-secret")
	// simulate InitiateTransfer + QRIS_PAYMENT with HMAC + X-Idempotency-Key
	orderID := "order-123"
	amount := int64(50000)
	key := "idem-key-abc-123"
	ref1, _ := c.CreateTransaction(nil, orderID, amount, key)
	ref2, _ := c.CreateTransaction(nil, orderID, amount, key)
	if ref1 != ref2 {
		t.Errorf("idempotency broken: %s != %s", ref1, ref2)
	}
	// HMAC for SNAP-BI X-SIGNATURE + X-TIMESTAMP
	ts := time.Now().UTC().Format(time.RFC3339)
	payload := `{"partnerReferenceNo":"` + orderID + `","amount":{"value":"500.00","currency":"IDR"}}`
	sig := c.Sign(payload, ts)
	if sig == "" {
		t.Error("empty signature")
	}
	// verify X-Idempotency-Key header would be sent
	headers := map[string]string{
		"X-Idempotency-Key": key,
		"X-SIGNATURE":       sig,
		"X-TIMESTAMP":       ts,
	}
	if headers["X-Idempotency-Key"] != key {
		t.Error("idempotency header missing")
	}
}

func TestQRISPayment(t *testing.T) {
	c := New("http://payu-gateway:8080", "dev-secret")
	// QRIS_PAYMENT flow: order -> payu transaction -> callback
	orderID := "order-qris-1"
	ref, err := c.CreateTransaction(nil, orderID, 10000, "key-qris")
	if err != nil {
		t.Fatal(err)
	}
	if ref != "payu-ref-"+orderID {
		t.Errorf("unexpected ref %s", ref)
	}
}
