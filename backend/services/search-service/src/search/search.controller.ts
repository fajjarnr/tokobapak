import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchProductDto, IndexProductDto } from './dto/search.dto';

@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  async searchProducts(@Query() dto: SearchProductDto) {
    return this.searchService.search(dto);
  }

  @Post('products')
  async indexProduct(@Body() dto: IndexProductDto) {
    return this.searchService.indexProduct(dto);
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    await this.searchService.deleteProduct(id);
    return { success: true };
  }

  @Get('suggest')
  async suggest(@Query('q') query: string) {
    const suggestions = await this.searchService.suggest(query || '');
    return { suggestions };
  }
}
