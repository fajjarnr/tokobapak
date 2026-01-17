import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendEmailDto, SendSmsDto, SendPushDto } from './dto/notification.dto';

@Controller('api/v1/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('email')
  async sendEmail(@Body() data: SendEmailDto) {
    return this.notificationService.sendEmail(data);
  }

  @Post('sms')
  async sendSms(@Body() data: SendSmsDto) {
    return this.notificationService.sendSms(data);
  }

  @Post('push')
  async sendPush(@Body() data: SendPushDto) {
    return this.notificationService.sendPush(data);
  }
}
