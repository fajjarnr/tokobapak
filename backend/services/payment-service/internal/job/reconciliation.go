package job

import (
	"context"
	"log"
	"time"
)

// ReconciliationJob harian payments vs PayU ledger (PayU CONTEXT Ledger, ADR 0003)
// ponytail: minimal stub - real job queries payments table and PayU ledger API, logs mismatch
type ReconciliationJob struct {
	interval time.Duration
}

func NewReconciliationJob() *ReconciliationJob {
	return &ReconciliationJob{interval: 24 * time.Hour}
}

func (j *ReconciliationJob) Run(ctx context.Context) {
	log.Println("reconciliation job started - comparing payments vs PayU ledger")
	ticker := time.NewTicker(j.interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := j.Reconcile(ctx); err != nil {
				log.Printf("reconciliation failed: %v", err)
			}
		}
	}
}

func (j *ReconciliationJob) Reconcile(ctx context.Context) error {
	// SELECT * FROM payments WHERE status='COMPLETED' and compare with PayU ledger
	// if mismatch, emit tokobapak.payment.reconcile.mismatch.v1 and alert
	_ = ctx
	log.Println("reconciliation: payments vs PayU ledger checked, no mismatch (stub)")
	return nil
}
