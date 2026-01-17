package id.tokobapak.promotionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class VoucherApplicationResult {
    private boolean valid;
    private BigDecimal discountAmount;
    private BigDecimal finalTotal;
    private String message;
}
