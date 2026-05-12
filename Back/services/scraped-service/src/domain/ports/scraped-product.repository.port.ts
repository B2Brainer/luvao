// src/domain/ports/scraped-product.repository.port.ts
import { ScrapedProduct } from "../entities/scraped-product.entity";

export type PriceStatsFilters = {
  storeName?: string;
  query?: string;
  days?: number;
};

export type DescriptiveStats = {
  count: number;
  min: number | null;
  max: number | null;
  avg: number | null;
  stdDev: number | null;
  cv: number | null;
};

export type PriceStatsResponse = {
  windowDays: number;
  since: string;
  totalRecords: number;
  overall: DescriptiveStats;
  byStore: Array<{ storeName: string; stats: DescriptiveStats }>;
  byQuery: Array<{ query: string; stats: DescriptiveStats }>;
};

export interface ScrapedProductRepositoryPort {
  bulkReplace(storeName: string, query: string, products: ScrapedProduct[]): Promise<void>;
  update(product: ScrapedProduct): Promise<ScrapedProduct>;
  delete(id: string): Promise<void>;

  findAll(): Promise<ScrapedProduct[]>;
  findById(id: string): Promise<ScrapedProduct | null>;
  findByFilters(filters: { storeName?: string; query?: string; name?: string; availability?: boolean; }): Promise<ScrapedProduct[]>;

  getPriceStats(filters: PriceStatsFilters): Promise<PriceStatsResponse>;
  exists(id: string): Promise<boolean>;
}
