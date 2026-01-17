import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [ConfigModule],
  controllers: [SearchController],
  providers: [
    {
      provide: 'ELASTICSEARCH_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Client({
          node: configService.get('ELASTICSEARCH_NODE', 'http://localhost:9200'),
        });
      },
      inject: [ConfigService],
    },
    SearchService,
  ],
  exports: [SearchService],
})
export class SearchModule {}
