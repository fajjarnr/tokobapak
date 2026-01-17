package id.tokobapak.promotionservice.controller;

import id.tokobapak.promotionservice.domain.PromoStatus;
import id.tokobapak.promotionservice.domain.Promotion;
import id.tokobapak.promotionservice.domain.Voucher;
import id.tokobapak.promotionservice.dto.*;
import id.tokobapak.promotionservice.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {
    
    private final PromotionService promotionService;
    
    @PostMapping
    public ResponseEntity<Promotion> createPromotion(@Valid @RequestBody CreatePromotionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionService.createPromotion(request));
    }
    
    @GetMapping
    public ResponseEntity<Page<Promotion>> getPromotions(
            @RequestParam(required = false) PromoStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(promotionService.getPromotions(status, pageable));
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Promotion>> getActivePromotions() {
        return ResponseEntity.ok(promotionService.getActivePromotions());
    }
    
    @PatchMapping("/{id}/activate")
    public ResponseEntity<Promotion> activatePromotion(@PathVariable UUID id) {
        return ResponseEntity.ok(promotionService.activatePromotion(id));
    }
    
    @PostMapping("/{promotionId}/vouchers")
    public ResponseEntity<Voucher> createVoucher(
            @PathVariable UUID promotionId,
            @RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        UUID userId = body.get("userId") != null ? UUID.fromString((String) body.get("userId")) : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionService.createVoucher(promotionId, code, userId));
    }
    
    @PostMapping("/vouchers/apply")
    public ResponseEntity<VoucherApplicationResult> applyVoucher(@Valid @RequestBody ApplyVoucherRequest request) {
        return ResponseEntity.ok(promotionService.applyVoucher(request));
    }
}
