package id.tokobapak.paymentservice.controller;

import id.tokobapak.paymentservice.domain.Payment;
import id.tokobapak.paymentservice.dto.ProcessPaymentRequest;
import id.tokobapak.paymentservice.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment processing endpoints")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    @Operation(summary = "Process Payment", description = "Execute payment ensuring idempotency")
    public ResponseEntity<Payment> processPayment(@Valid @RequestBody ProcessPaymentRequest request) {
        return ResponseEntity.ok(paymentService.executePayment(request));
    }
}
