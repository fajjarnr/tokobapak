import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SendSmsDto } from '../dto/notification.dto';

@Processor('sms')
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);

  async process(job: Job<SendSmsDto>): Promise<void> {
    this.logger.log(`Processing SMS job ${job.id}`);
    
    const { phoneNumber, message } = job.data;
    
    try {
      await this.sendSms(phoneNumber, message);
      
      this.logger.log(`SMS sent successfully to ${phoneNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}: ${error.message}`);
      throw error;
    }
  }

  private async sendSms(phoneNumber: string, message: string): Promise<void> {
    // Simulate SMS sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    this.logger.log(`[SIMULATED] SMS to: ${phoneNumber}, Message: ${message.substring(0, 50)}...`);
    
    // TODO: Integrate with SMS provider (Twilio, Nexmo, local providers like Zenziva)
  }
}
