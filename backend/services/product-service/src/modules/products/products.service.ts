import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(options?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    status?: ProductStatus;
  }): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 12;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.media', 'media')
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (options?.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', {
        categoryId: options.categoryId,
      });
    }

    if (options?.status) {
      queryBuilder.andWhere('product.status = :status', {
        status: options.status,
      });
    } else {
      queryBuilder.andWhere('product.status = :status', {
        status: ProductStatus.ACTIVE,
      });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants', 'media'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['variants', 'media'],
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async create(
    sellerId: string,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    const slug = this.generateSlug(createProductDto.name);

    const product = this.productRepository.create({
      ...createProductDto,
      sellerId,
      slug,
    });

    return this.productRepository.save(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    const newName = (updateProductDto as { name?: string }).name;
    if (newName && newName !== product.name) {
      product.slug = this.generateSlug(newName);
    }

    Object.assign(product, updateProductDto);

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.productRepository.increment({ id }, 'viewCount', 1);
  }

  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const uniqueId = Date.now().toString(36);
    return `${baseSlug}-${uniqueId}`;
  }
}
