package id.tokobapak.orderservice.controller;

import id.tokobapak.orderservice.domain.Order;
import id.tokobapak.orderservice.dto.CreateOrderRequest;
import id.tokobapak.orderservice.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create Order", description = "Create a new order and trigger events")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Order", description = "Get order details by ID")
    public ResponseEntity<Order> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get User Orders", description = "Get all orders for a specific user")
    public ResponseEntity<Page<Order>> getUserOrders(
            @PathVariable UUID userId,
            Pageable pageable) {
        return ResponseEntity.ok(orderService.getUserOrders(userId, pageable));
    }
}
