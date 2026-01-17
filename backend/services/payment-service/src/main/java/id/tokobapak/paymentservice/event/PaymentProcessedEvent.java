package id.tokobapak.paymentservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentProcessedEvent {
    private UUID paymentId;
    private UUID orderId;
    private String status;
    private String transactionId;
    private BigDecimal amount;
}
