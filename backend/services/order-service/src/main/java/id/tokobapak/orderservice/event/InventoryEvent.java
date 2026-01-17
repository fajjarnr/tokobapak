package id.tokobapak.orderservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryEvent {
    private UUID orderId;
    private String status; // "STOCK_RESERVED" or "STOCK_RESERVATION_FAILED"
    private String reason;
}
