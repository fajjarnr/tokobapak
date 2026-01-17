package id.tokobapak.paymentservice.service;

import id.tokobapak.paymentservice.domain.Payment;
import id.tokobapak.paymentservice.domain.PaymentStatus;
import id.tokobapak.paymentservice.dto.ProcessPaymentRequest;
import id.tokobapak.paymentservice.event.OrderCreatedEvent;
import id.tokobapak.paymentservice.event.PaymentProcessedEvent;
import id.tokobapak.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StreamBridge streamBridge;

    @Bean
    public Consumer<OrderCreatedEvent> processPayment() {
        return event -> {
            log.info("Received OrderCreatedEvent for order: {}", event.getOrderId());
            
            // In a real scenario, this would trigger payment processing logic
            // providing an initial PENDING payment record
            Payment payment = Payment.builder()
                    .orderId(event.getOrderId())
                    .userId(event.getUserId())
                    .amount(event.getTotalAmount())
                    .status(PaymentStatus.PENDING)
                    .build();
            
            paymentRepository.save(payment);
            log.info("Initialized pending payment for order: {}", event.getOrderId());
        };
    }

    @Transactional
    public Payment executePayment(ProcessPaymentRequest request) {
        log.info("Processing payment for order: {}", request.getOrderId());

        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElse(Payment.builder()
                        .orderId(request.getOrderId())
                        .userId(request.getUserId())
                        .amount(request.getAmount())
                        .status(PaymentStatus.PENDING)
                        .build());
        
        // Simulate payment gateway interaction
        boolean success = simulatePaymentGateway(request);

        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
        payment.setTransactionId(UUID.randomUUID().toString());
        
        Payment savedPayment = paymentRepository.save(payment);
        
        // Publish event
        PaymentProcessedEvent event = PaymentProcessedEvent.builder()
                .paymentId(savedPayment.getId())
                .orderId(savedPayment.getOrderId())
                .status(savedPayment.getStatus().name())
                .transactionId(savedPayment.getTransactionId())
                .amount(savedPayment.getAmount())
                .build();
        
        streamBridge.send("paymentEvents-out-0", event);
        log.info("Payment processed with status: {}", savedPayment.getStatus());

        return savedPayment;
    }
    
    private boolean simulatePaymentGateway(ProcessPaymentRequest request) {
        // Mock gateway logic - assume success for amount > 0
        return request.getAmount().signum() > 0;
    }
}
