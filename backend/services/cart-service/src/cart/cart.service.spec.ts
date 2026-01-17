import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CartService } from './cart.service';

// Mock Redis
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

// Mock ioredis constructor
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedis);
});

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => defaultValue),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToCart', () => {
    it('should add item to new cart', async () => {
        const userId = 'user-1';
        mockRedis.get.mockResolvedValue(null);
        
        const itemDto = { productId: 'p1', variantId: 'v1', quantity: 1, price: 100 };
        const result = await service.addToCart(userId, itemDto);
        
        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toEqual(expect.objectContaining(itemDto));
        expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should increment quantity if item exists', async () => {
        const userId = 'user-1';
        const existingCart = {
            userId,
            items: [{ productId: 'p1', variantId: 'v1', quantity: 1, price: 100 }],
        };
        mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
        
        const itemDto = { productId: 'p1', variantId: 'v1', quantity: 2, price: 100 };
        const result = await service.addToCart(userId, itemDto);
        
        expect(result.items).toHaveLength(1);
        expect(result.items[0].quantity).toBe(3);
    });
  });

  describe('removeItem', () => {
      it('should remove item from cart', async () => {
         const userId = 'user-1';
         const existingCart = {
            userId,
            items: [{ productId: 'p1', variantId: undefined, quantity: 1, price: 100 }],
         };
         mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
         
         const result = await service.removeItem(userId, 'p1');
         expect(result.items).toHaveLength(0);
         expect(mockRedis.set).toHaveBeenCalled();
      });
  });

  describe('clearCart', () => {
      it('should delete cart from redis', async () => {
          await service.clearCart('user-1');
          expect(mockRedis.del).toHaveBeenCalledWith('cart:user-1');
      });
  });
});
