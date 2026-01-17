import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product, ProductStatus } from './entities/product.entity';
import { CreateProductDto } from './dto';

const mockProduct: Product = {
  id: 'uuid',
  name: 'Test Product',
  slug: 'test-product',
  description: 'Description',
  price: 100,
  categoryId: 'category-id',
  sellerId: 'seller-id',
  variants: [],
  media: [],
  status: ProductStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  stock: 10,
  weight: 1,
  viewCount: 0,
  soldCount: 0,
  reviewCount: 0,
  rating: 0,
};

const mockProductRepository = {
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
  })),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  increment: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const result = await service.findAll({ page: 1, limit: 12 });
      expect(result).toEqual({
        data: [mockProduct],
        total: 1,
        page: 1,
        limit: 12,
      });
      expect(repository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      const result = await service.findOne('uuid');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and save a product', async () => {
      const createDto: CreateProductDto = {
        name: 'New Product',
        description: 'Desc',
        price: 200,
        categoryId: 'cat-id',
        stock: 5,
        weight: 1,
      };
      
      const newProduct = { ...mockProduct, ...createDto };
      mockProductRepository.create.mockReturnValue(newProduct);
      mockProductRepository.save.mockResolvedValue(newProduct);

      const result = await service.create('seller-id', createDto);
      expect(result).toEqual(newProduct);
      expect(mockProductRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
    });
  });
});
