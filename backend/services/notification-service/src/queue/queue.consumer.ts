import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';

// Kafka event types from other services
interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  totalAmount: number;
  status: string;
}

interface PaymentProcessedEvent {
  paymentId: string;
  orderId: string;
  status: string;
  amount: number;
}

interface ShipmentCreatedEvent {
  shipmentId: string;
  orderId: string;
  status: string;
  courierCode: string;
}

@Injectable()
export class QueueConsumer implements OnModuleInit {
  private readonly logger = new Logger(QueueConsumer.name);

  constructor(private readonly notificationService: NotificationService) {}

  onModuleInit() {
    this.logger.log('Queue Consumer initialized - ready to process events');
    // In production, connect to Kafka and subscribe to topics
    // For now, events can be triggered via REST API
  }

  // These methods would be called by Kafka consumer
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    this.logger.log(`Handling order.created event for order: ${event.orderId}`);
    
    // In a real scenario, fetch user email from user-service
    const userEmail = 'customer@example.com'; // Placeholder
    
    await this.notificationService.sendOrderConfirmation(
      event.orderId,
      event.userId,
      userEmail,
    );
  }

  async handlePaymentProcessed(event: PaymentProcessedEvent): Promise<void> {
    this.logger.log(`Handling payment.processed event for order: ${event.orderId}`);
    
    if (event.status === 'COMPLETED') {
      const userEmail = 'customer@example.com'; // Placeholder
      await this.notificationService.sendPaymentSuccess(
        event.orderId,
        userEmail,
        event.amount,
      );
    }
  }

  async handleShipmentUpdate(event: ShipmentCreatedEvent): Promise<void> {
    this.logger.log(`Handling shipment.events for order: ${event.orderId}`);
    
    const userEmail = 'customer@example.com'; // Placeholder
    await this.notificationService.sendShipmentUpdate(
      event.orderId,
      userEmail,
      event.status,
      event.courierCode,
    );
  }
}
