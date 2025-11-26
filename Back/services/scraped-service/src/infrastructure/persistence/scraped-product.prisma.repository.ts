// /infrastructure/persistence/scraped-product.prisma.repository.ts
import { Injectable } from '@nestjs/common';
import { ScrapedProduct } from '../../domain/entities/scraped-product.entity';
import { ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScrapedProductPrismaRepository implements ScrapedProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async bulkReplace(storeName: string, query: string, products: ScrapedProduct[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Eliminar productos existentes para esta combinación storeName + query
      await tx.scrapedProduct.deleteMany({
        where: {
          storeName,
          query,
        },
      });

      // 2. Insertar nuevos productos
      if (products.length > 0) {
        await tx.scrapedProduct.createMany({
          data: products.map(product => ({
            id: product.id,
            storeName: product.storeName,
            query: product.query,
            name: product.name,
            price: product.price,
            url: product.url,
            availability: product.availability,
            scrapedAt: product.scrapedAt,
          })),
        });
      }
    });
  }

  async update(product: ScrapedProduct): Promise<ScrapedProduct> {
    const updated = await this.prisma.scrapedProduct.update({
      where: { id: product.id },
      data: {
        price: product.price,
        availability: product.availability,
        url: product.url,
      },
    });
    return new ScrapedProduct(
      updated.id,
      updated.storeName,
      updated.query,
      updated.name,
      updated.price,
      updated.url,
      updated.availability,
      updated.scrapedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.scrapedProduct.delete({
      where: { id },
    });
  }

  async findAll(): Promise<ScrapedProduct[]> {
    const products = await this.prisma.scrapedProduct.findMany({
      orderBy: { scrapedAt: 'desc' },
    });
    return products.map(p => new ScrapedProduct(
      p.id,
      p.storeName,
      p.query,
      p.name,
      p.price,
      p.url,
      p.availability,
      p.scrapedAt
    ));
  }

  async findById(id: string): Promise<ScrapedProduct | null> {
    const product = await this.prisma.scrapedProduct.findUnique({
      where: { id },
    });
    return product ? new ScrapedProduct(
      product.id,
      product.storeName,
      product.query,
      product.name,
      product.price,
      product.url,
      product.availability,
      product.scrapedAt
    ) : null;
  }

  async findByFilters(filters: { 
    storeName?: string; 
    query?: string; 
    name?: string; 
    availability?: boolean; 
  }): Promise<ScrapedProduct[]> {
    const where: any = {};

    if (filters.storeName) {
      where.storeName = { contains: filters.storeName, mode: 'insensitive' };
    }

    if (filters.query) {
      where.query = { contains: filters.query, mode: 'insensitive' };
    }

    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters.availability !== undefined) {
      where.availability = filters.availability;
    }

    const products = await this.prisma.scrapedProduct.findMany({
      where,
      orderBy: { scrapedAt: 'desc' },
    });
    return products.map(p => new ScrapedProduct(
      p.id,
      p.storeName,
      p.query,
      p.name,
      p.price,
      p.url,
      p.availability,
      p.scrapedAt
    ));
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.scrapedProduct.count({
      where: { id },
    });
    return count > 0;
  }
}