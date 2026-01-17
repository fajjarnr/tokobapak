package id.tokobapak.promotionservice.dto;

import id.tokobapak.promotionservice.domain.PromoType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreatePromotionRequest {
    @NotBlank
    private String name;
    
    private String description;
    
    @NotNull
    private PromoType type;
    
    @NotNull
    private BigDecimal discountValue;
    
    private BigDecimal minPurchase;
    private BigDecimal maxDiscount;
    
    @NotNull
    private LocalDateTime startDate;
    
    @NotNull
    private LocalDateTime endDate;
    
    private Integer usageLimit;
}
