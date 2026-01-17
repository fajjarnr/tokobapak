package id.tokobapak.promotionservice.repository;

import id.tokobapak.promotionservice.domain.Promotion;
import id.tokobapak.promotionservice.domain.PromoStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, UUID> {
    Page<Promotion> findByStatus(PromoStatus status, Pageable pageable);
    
    @Query("SELECT p FROM Promotion p WHERE p.status = 'ACTIVE' AND p.startDate <= ?1 AND p.endDate >= ?1")
    List<Promotion> findActivePromotions(LocalDateTime now);
}
