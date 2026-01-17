import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { SellerService } from './seller.service';
import { CreateSellerDto, UpdateSellerDto, UpdateSellerStatusDto } from './dto/seller.dto';
import { SellerStatus } from './entities/seller.entity';

@Controller('api/v1/sellers')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Post()
  async create(@Body() dto: CreateSellerDto) {
    return this.sellerService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('status') status?: SellerStatus,
  ) {
    return this.sellerService.findAll(+page, +pageSize, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sellerService.findOne(id);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.sellerService.findByUserId(userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSellerDto) {
    return this.sellerService.update(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateSellerStatusDto) {
    return this.sellerService.updateStatus(id, dto);
  }

  @Patch(':id/verify')
  async verify(@Param('id') id: string) {
    return this.sellerService.verify(id);
  }
}
