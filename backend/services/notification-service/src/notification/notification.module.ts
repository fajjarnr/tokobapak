import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EmailProcessor } from './processors/email.processor';
import { SmsProcessor } from './processors/sms.processor';
import { PushProcessor } from './processors/push.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'sms' },
      { name: 'push' },
    ),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailProcessor,
    SmsProcessor,
    PushProcessor,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
