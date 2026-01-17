import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SendEmailDto, SendSmsDto, SendPushDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('sms') private smsQueue: Queue,
    @InjectQueue('push') private pushQueue: Queue,
  ) {}

  async sendEmail(data: SendEmailDto): Promise<{ jobId: string }> {
    const job = await this.emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    this.logger.log(`Email job created: ${job.id}`);
    return { jobId: job.id };
  }

  async sendSms(data: SendSmsDto): Promise<{ jobId: string }> {
    const job = await this.smsQueue.add('send-sms', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    this.logger.log(`SMS job created: ${job.id}`);
    return { jobId: job.id };
  }

  async sendPush(data: SendPushDto): Promise<{ jobId: string }> {
    const job = await this.pushQueue.add('send-push', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    this.logger.log(`Push job created: ${job.id}`);
    return { jobId: job.id };
  }

  async sendOrderConfirmation(orderId: string, userId: string, email: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Pesanan Anda Telah Dikonfirmasi',
      template: 'order-confirmation',
      context: { orderId, userId },
    });
  }

  async sendPaymentSuccess(orderId: string, email: string, amount: number): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Pembayaran Berhasil',
      template: 'payment-success',
      context: { orderId, amount },
    });
  }

  async sendShipmentUpdate(orderId: string, email: string, status: string, trackingNumber: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Update Pengiriman: ${status}`,
      template: 'shipment-update',
      context: { orderId, status, trackingNumber },
    });
  }
}
