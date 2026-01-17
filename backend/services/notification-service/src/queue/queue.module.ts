import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueConsumer } from './queue.consumer';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'notification-service',
              brokers: [configService.get('KAFKA_BROKERS', 'localhost:9092')],
            },
            consumer: {
              groupId: 'notification-service-group',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [QueueConsumer],
})
export class QueueModule {}
