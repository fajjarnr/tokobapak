package id.tokobapak.promotionservice.service;

import id.tokobapak.promotionservice.domain.*;
import id.tokobapak.promotionservice.dto.*;
import id.tokobapak.promotionservice.repository.PromotionRepository;
import id.tokobapak.promotionservice.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionService {
    
    private final PromotionRepository promotionRepository;
    private final VoucherRepository voucherRepository;
    
    public Promotion createPromotion(CreatePromotionRequest request) {
        Promotion promo = new Promotion();
        promo.setName(request.getName());
        promo.setDescription(request.getDescription());
        promo.setType(request.getType());
        promo.setDiscountValue(request.getDiscountValue());
        promo.setMinPurchase(request.getMinPurchase() != null ? request.getMinPurchase() : BigDecimal.ZERO);
        promo.setMaxDiscount(request.getMaxDiscount());
        promo.setStartDate(request.getStartDate());
        promo.setEndDate(request.getEndDate());
        promo.setUsageLimit(request.getUsageLimit());
        promo.setStatus(PromoStatus.DRAFT);
        return promotionRepository.save(promo);
    }
    
    public Page<Promotion> getPromotions(PromoStatus status, Pageable pageable) {
        if (status != null) {
            return promotionRepository.findByStatus(status, pageable);
        }
        return promotionRepository.findAll(pageable);
    }
    
    public List<Promotion> getActivePromotions() {
        return promotionRepository.findActivePromotions(LocalDateTime.now());
    }
    
    public Promotion activatePromotion(UUID id) {
        Promotion promo = promotionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Promotion not found"));
        promo.setStatus(PromoStatus.ACTIVE);
        return promotionRepository.save(promo);
    }
    
    public Voucher createVoucher(UUID promotionId, String code, UUID userId) {
        Promotion promo = promotionRepository.findById(promotionId)
            .orElseThrow(() -> new RuntimeException("Promotion not found"));
        
        Voucher voucher = new Voucher();
        voucher.setCode(code);
        voucher.setPromotion(promo);
        voucher.setUserId(userId);
        return voucherRepository.save(voucher);
    }
    
    @Transactional
    public VoucherApplicationResult applyVoucher(ApplyVoucherRequest request) {
        Voucher voucher = voucherRepository.findByCode(request.getVoucherCode())
            .orElse(null);
        
        if (voucher == null) {
            return new VoucherApplicationResult(false, BigDecimal.ZERO, request.getOrderTotal(), "Voucher not found");
        }
        
        if (voucher.getIsUsed()) {
            return new VoucherApplicationResult(false, BigDecimal.ZERO, request.getOrderTotal(), "Voucher already used");
        }
        
        Promotion promo = voucher.getPromotion();
        LocalDateTime now = LocalDateTime.now();
        
        if (promo.getStatus() != PromoStatus.ACTIVE) {
            return new VoucherApplicationResult(false, BigDecimal.ZERO, request.getOrderTotal(), "Promotion not active");
        }
        
        if (now.isBefore(promo.getStartDate()) || now.isAfter(promo.getEndDate())) {
            return new VoucherApplicationResult(false, BigDecimal.ZERO, request.getOrderTotal(), "Promotion expired");
        }
        
        if (request.getOrderTotal().compareTo(promo.getMinPurchase()) < 0) {
            return new VoucherApplicationResult(false, BigDecimal.ZERO, request.getOrderTotal(), 
                "Minimum purchase of " + promo.getMinPurchase() + " required");
        }
        
        BigDecimal discount = calculateDiscount(promo, request.getOrderTotal());
        BigDecimal finalTotal = request.getOrderTotal().subtract(discount);
        
        voucher.setIsUsed(true);
        voucher.setUsedAt(now);
        voucher.setOrderId(request.getOrderId());
        voucherRepository.save(voucher);
        
        promo.setUsedCount(promo.getUsedCount() + 1);
        promotionRepository.save(promo);
        
        return new VoucherApplicationResult(true, discount, finalTotal, "Voucher applied successfully");
    }
    
    private BigDecimal calculateDiscount(Promotion promo, BigDecimal orderTotal) {
        BigDecimal discount;
        
        switch (promo.getType()) {
            case PERCENTAGE:
                discount = orderTotal.multiply(promo.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                break;
            case FIXED_AMOUNT:
                discount = promo.getDiscountValue();
                break;
            case FREE_SHIPPING:
                discount = promo.getDiscountValue(); // shipping cost
                break;
            default:
                discount = BigDecimal.ZERO;
        }
        
        if (promo.getMaxDiscount() != null && discount.compareTo(promo.getMaxDiscount()) > 0) {
            discount = promo.getMaxDiscount();
        }
        
        return discount;
    }
}
