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

export type DailyPricePoint = {
  date: string;
  stats: DescriptiveStats;
};

export type PriceSeriesResponse = {
  windowDays: number;
  since: string;
  totalRecords: number;
  overallDaily: DailyPricePoint[];
  byStore: Array<{ storeName: string; series: DailyPricePoint[] }>;
  byQuery: Array<{ query: string; series: DailyPricePoint[] }>;
};

export interface ScrapedProductRepositoryPort {
  bulkReplace(storeName: string, query: string, products: ScrapedProduct[]): Promise<void>;
  update(product: ScrapedProduct): Promise<ScrapedProduct>;
  delete(id: string): Promise<void>;

  findAll(): Promise<ScrapedProduct[]>;
  findById(id: string): Promise<ScrapedProduct | null>;
  findByFilters(filters: { storeName?: string; query?: string; name?: string; availability?: boolean; }): Promise<ScrapedProduct[]>;

  getPriceStats(filters: PriceStatsFilters): Promise<PriceStatsResponse>;
  getPriceSeries(filters: PriceStatsFilters): Promise<PriceSeriesResponse>;
  exists(id: string): Promise<boolean>;
}
