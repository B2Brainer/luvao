// /infrastructure/persistence/scraped-product.prisma.repository.ts
import { Injectable } from '@nestjs/common';
import {
  DescriptiveStats,
  PriceStatsFilters,
  PriceStatsResponse,
  ScrapedProductRepositoryPort,
} from '../../domain/ports/scraped-product.repository.port';
import { ScrapedProduct } from '../../domain/entities/scraped-product.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScrapedProductPrismaRepository implements ScrapedProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async bulkReplace(storeName: string, query: string, products: ScrapedProduct[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Guardar snapshot histórico antes de reemplazar la vista "actual".
      if (products.length > 0) {
        await tx.scrapedProductHistory.createMany({
          data: products.map((product) => ({
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

      await tx.scrapedProduct.deleteMany({
        where: {
          storeName,
          query,
        },
      });

      if (products.length > 0) {
        await tx.scrapedProduct.createMany({
          data: products.map((product) => ({
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

  async getPriceStats(filters: PriceStatsFilters): Promise<PriceStatsResponse> {
    const days = Number.isFinite(filters.days) && (filters.days as number) > 0
      ? Math.floor(filters.days as number)
      : 7;

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const where: any = {
      scrapedAt: { gte: since },
    };

    if (filters.storeName) {
      where.storeName = { contains: filters.storeName, mode: 'insensitive' };
    }

    if (filters.query) {
      where.query = { contains: filters.query, mode: 'insensitive' };
    }

    const rows = await this.prisma.scrapedProductHistory.findMany({
      where,
      select: {
        storeName: true,
        query: true,
        price: true,
      },
    });

    const validRows = rows.filter((row) => row.price !== null && row.price > 0) as Array<{
      storeName: string;
      query: string;
      price: number;
    }>;

    const byStoreMap = new Map<string, number[]>();
    const byQueryMap = new Map<string, number[]>();

    for (const row of validRows) {
      const storePrices = byStoreMap.get(row.storeName) ?? [];
      storePrices.push(row.price);
      byStoreMap.set(row.storeName, storePrices);

      const queryPrices = byQueryMap.get(row.query) ?? [];
      queryPrices.push(row.price);
      byQueryMap.set(row.query, queryPrices);
    }

    return {
      windowDays: days,
      since: since.toISOString(),
      totalRecords: validRows.length,
      overall: this.calculateStats(validRows.map((r) => r.price)),
      byStore: [...byStoreMap.entries()]
        .map(([storeName, prices]) => ({
          storeName,
          stats: this.calculateStats(prices),
        }))
        .sort((a, b) => b.stats.count - a.stats.count),
      byQuery: [...byQueryMap.entries()]
        .map(([query, prices]) => ({
          query,
          stats: this.calculateStats(prices),
        }))
        .sort((a, b) => b.stats.count - a.stats.count),
    };
  }

  private calculateStats(prices: number[]): DescriptiveStats {
    if (prices.length === 0) {
      return {
        count: 0,
        min: null,
        max: null,
        avg: null,
        stdDev: null,
        cv: null,
      };
    }

    const count = prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((acc, p) => acc + p, 0) / count;
    const variance = prices.reduce((acc, p) => acc + Math.pow(p - avg, 2), 0) / count;
    const stdDev = Math.sqrt(variance);
    const cv = avg > 0 ? stdDev / avg : null;

    return {
      count,
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      avg: Number(avg.toFixed(2)),
      stdDev: Number(stdDev.toFixed(2)),
      cv: cv === null ? null : Number(cv.toFixed(4)),
    };
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
    return products.map((p) => new ScrapedProduct(
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
    return products.map((p) => new ScrapedProduct(
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
