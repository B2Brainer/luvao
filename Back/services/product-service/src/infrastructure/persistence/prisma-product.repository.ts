import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { price: 'asc' },
    });
    
    return products.map(product => 
      new Product(
        product.id,
        product.name,
        product.type,
        product.price,
        product.storeId,
        product.createdAt,
      )
    );
  }

  async findById(id: number): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) return null;

    return new Product(
      product.id,
      product.name,
      product.type,
      product.price,
      product.storeId,
      product.createdAt,
    );
  }

  async filterByType(type: string): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { type },
      orderBy: { price: 'asc' },
    });

    return products.map(product => 
      new Product(
        product.id,
        product.name,
        product.type,
        product.price,
        product.storeId,
        product.createdAt,
      )
    );
  }

  async filterByTypeAndStores(type: string, storeIds: number[]): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        type,
        storeId: { in: storeIds },
      },
      orderBy: { price: 'asc' },
    });

    return products.map(product => 
      new Product(
        product.id,
        product.name,
        product.type,
        product.price,
        product.storeId,
        product.createdAt,
      )
    );
  }

  async createMany(products: Product[]): Promise<{ count: number }> {
    const result = await this.prisma.product.createMany({
      data: products.map(product => ({
        name: product.name,
        type: product.type,
        price: product.price,
        storeId: product.storeId,
      })),
      skipDuplicates: true,
    });

    return { count: result.count };
  }
}