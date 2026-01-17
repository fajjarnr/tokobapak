package id.tokobapak.orderservice.config;

import id.tokobapak.orderservice.event.InventoryEvent;
import id.tokobapak.orderservice.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.function.Consumer;

@Configuration
@Slf4j
public class EventConsumerConfig {

    @Bean
    public Consumer<InventoryEvent> orderEvents(OrderService orderService) {
        return event -> {
            log.info("Received InventoryEvent for order: {}, status: {}", event.getOrderId(), event.getStatus());
            
            if ("STOCK_RESERVED".equals(event.getStatus())) {
                orderService.handleInventoryStockReserved(event.getOrderId());
            } else if ("STOCK_RESERVATION_FAILED".equals(event.getStatus()) || "FAILED".equals(event.getStatus())) {
                orderService.handleInventoryStockFailed(event.getOrderId(), event.getReason());
            } else {
                log.warn("Unknown event status: {}", event.getStatus());
            }
        };
    }
}
