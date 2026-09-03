package service

import (
	"context"
	"testing"
)

func TestNotifyValid(t *testing.T) {
	svc := NewService()
	err := svc.Notify(context.Background(), "tokobapak.payment.completed.v1",
		[]byte(`{"order_id":"o1","payu_reference":"PAYU-1","amount":50000,"status":"COMPLETED"}`))
	if err != nil {
		t.Fatal(err)
	}
}

func TestNotifyBadJSONGoesToDLQ(t *testing.T) {
	svc := NewService()
	if err := svc.Notify(context.Background(), "tokobapak.payment.completed.v1", []byte(`{oops`)); err == nil {
		t.Fatal("expected error on malformed JSON")
	}
	if err := svc.Notify(context.Background(), "tokobapak.payment.completed.v1", []byte(`{"status":"COMPLETED"}`)); err == nil {
		t.Fatal("expected error on missing order_id")
	}
}
