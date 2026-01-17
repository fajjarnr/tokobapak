package id.tokobapak.promotionservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ApplyVoucherRequest {
    @NotBlank
    private String voucherCode;
    
    @NotNull
    private UUID userId;
    
    @NotNull
    private BigDecimal orderTotal;
    
    @NotNull
    private UUID orderId;
}
