import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { ProductMedia } from './product-media.entity';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  sellerId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  discountPrice: number | null;

  @Column()
  @Index()
  categoryId: string;

  @Column({ nullable: true })
  brandId: string | null;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  @Index()
  status: ProductStatus;

  @Column({ type: 'jsonb', nullable: true })
  attributes: Record<string, unknown> | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  weight: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: { length: number; width: number; height: number } | null;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @OneToMany(() => ProductMedia, (media) => media.product, {
    cascade: true,
  })
  media: ProductMedia[];

  @Column({ default: 0 })
  viewCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
