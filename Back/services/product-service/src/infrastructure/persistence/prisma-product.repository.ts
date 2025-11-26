// /infrastructure/persistence/prisma-product.repository.ts
import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(product: Product): Promise<Product> {
    const saved = await this.prisma.product.upsert({
      where: { id: product.id },
      update: { name: product.name },
      create: { 
        id: product.id, 
        name: product.name 
      },
    });
    return new Product(saved.id, saved.name);
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    return product ? new Product(product.id, product.name) : null;
  }

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    return products.map(p => new Product(p.id, p.name));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Product | null> {
    const product = await this.prisma.product.findFirst({
      where: { name },
    });
    return product ? new Product(product.id, product.name) : null;
  }

  async getAllProductNames(): Promise<string[]> {
    const products = await this.prisma.product.findMany({
      select: { name: true },
    });
    return products.map(p => p.name);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { name },
    });
    return count > 0;
  }
}