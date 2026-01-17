import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { SearchProductDto, IndexProductDto, SearchResult } from './dto/search.dto';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly productIndex = 'products';

  constructor(
    @Inject('ELASTICSEARCH_CLIENT') private readonly esClient: Client,
  ) { }

  async onModuleInit() {
    await this.createIndexIfNotExists();
  }

  private async createIndexIfNotExists(): Promise<void> {
    try {
      const exists = await this.esClient.indices.exists({ index: this.productIndex });
      if (!exists) {
        await this.esClient.indices.create({
          index: this.productIndex,
          mappings: {
            properties: {
              name: { type: 'text', analyzer: 'standard' },
              description: { type: 'text', analyzer: 'standard' },
              category: { type: 'keyword' },
              brand: { type: 'keyword' },
              price: { type: 'float' },
              tags: { type: 'keyword' },
              createdAt: { type: 'date' },
            },
          },
        });
        this.logger.log('Created products index');
      }
    } catch (error) {
      this.logger.warn(`Index creation skipped: ${error.message}`);
    }
  }

  async search(dto: SearchProductDto): Promise<SearchResult> {
    const { query, category, brand, minPrice, maxPrice, page = 1, pageSize = 10 } = dto;

    const must: any[] = [];
    const filter: any[] = [];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['name^2', 'description', 'tags'],
          fuzziness: 'AUTO',
        },
      });
    }

    if (category) {
      filter.push({ term: { category } });
    }

    if (brand) {
      filter.push({ term: { brand } });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const range: any = {};
      if (minPrice !== undefined) range.gte = minPrice;
      if (maxPrice !== undefined) range.lte = maxPrice;
      filter.push({ range: { price: range } });
    }

    const response = await this.esClient.search({
      index: this.productIndex,
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter,
        },
      },
      sort: [{ _score: 'desc' }, { createdAt: 'desc' }] as any,
      from: (page - 1) * pageSize,
      size: pageSize,
      _source: ['name', 'description', 'category', 'brand', 'price', 'tags'],
    });

    const hits = response.hits.hits.map((hit) => ({
      id: hit._id,
      score: hit._score,
      ...hit._source as object,
    }));

    const total = typeof response.hits.total === 'number'
      ? response.hits.total
      : response.hits.total?.value || 0;

    return {
      items: hits,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async indexProduct(dto: IndexProductDto): Promise<{ id: string }> {
    const response = await this.esClient.index({
      index: this.productIndex,
      id: dto.id,
      document: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        brand: dto.brand,
        price: dto.price,
        tags: dto.tags,
        createdAt: new Date().toISOString(),
      },
    });

    this.logger.log(`Indexed product: ${response._id}`);
    return { id: response._id };
  }

  async deleteProduct(id: string): Promise<void> {
    await this.esClient.delete({
      index: this.productIndex,
      id,
    });
    this.logger.log(`Deleted product: ${id}`);
  }

  async suggest(prefix: string): Promise<string[]> {
    const response = await this.esClient.search({
      index: this.productIndex,
      query: {
        match_phrase_prefix: {
          name: prefix,
        },
      },
      size: 5,
      _source: ['name'],
    });

    return response.hits.hits.map((hit) => (hit._source as any).name);
  }
}
