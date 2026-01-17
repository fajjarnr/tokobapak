import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller, SellerStatus } from './entities/seller.entity';
import { CreateSellerDto, UpdateSellerDto, UpdateSellerStatusDto } from './dto/seller.dto';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}

  async create(dto: CreateSellerDto): Promise<Seller> {
    const seller = this.sellerRepository.create(dto);
    return this.sellerRepository.save(seller);
  }

  async findAll(page = 1, pageSize = 10, status?: SellerStatus): Promise<{ data: Seller[]; total: number }> {
    const where = status ? { status } : {};
    const [data, total] = await this.sellerRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findOne(id: string): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({ where: { id } });
    if (!seller) {
      throw new NotFoundException(`Seller ${id} not found`);
    }
    return seller;
  }

  async findByUserId(userId: string): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({ where: { userId } });
    if (!seller) {
      throw new NotFoundException(`Seller for user ${userId} not found`);
    }
    return seller;
  }

  async update(id: string, dto: UpdateSellerDto): Promise<Seller> {
    const seller = await this.findOne(id);
    Object.assign(seller, dto);
    return this.sellerRepository.save(seller);
  }

  async updateStatus(id: string, dto: UpdateSellerStatusDto): Promise<Seller> {
    const seller = await this.findOne(id);
    seller.status = dto.status;
    return this.sellerRepository.save(seller);
  }

  async verify(id: string): Promise<Seller> {
    const seller = await this.findOne(id);
    seller.verified = true;
    seller.status = SellerStatus.ACTIVE;
    return this.sellerRepository.save(seller);
  }

  async incrementStats(id: string, type: 'products' | 'sales'): Promise<void> {
    if (type === 'products') {
      await this.sellerRepository.increment({ id }, 'totalProducts', 1);
    } else {
      await this.sellerRepository.increment({ id }, 'totalSales', 1);
    }
  }
}
