// /application/clients/scraped.client.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SERVICES } from '../../config/orchestrator.config';

type ScrapedFilters = {
  storeName?: string;
  query?: string;
  name?: string;
  availability?: boolean;
};

type PriceStatsFilters = {
  query?: string;
  storeName?: string;
  days?: number;
};

@Injectable()
export class ScrapedClient {
  constructor(private http: HttpService) {}

  async searchByQuery(query: string) {
    const response = await this.http.axiosRef.get(
      `${SERVICES.SCRAPED}/searched-products/query/${query}`
    );
    return response.data;
  }

  async getAllScrapedProducts() {
    const response = await this.http.axiosRef.get(
      `${SERVICES.SCRAPED}/searched-products`
    );
    return response.data;
  }

  async bulkReplaceScrapedProducts(data: any) {
    const response = await this.http.axiosRef.post(
      `${SERVICES.SCRAPED}/searched-products/bulk-replace`,
      data
    );
    return response.data;
  }

  async searchByAvailability(availability: boolean) {
    const response = await this.http.axiosRef.get(
      `${SERVICES.SCRAPED}/searched-products/availability/${availability}`
    );
    return response.data;
  }

  async searchByName(name: string) {
    const response = await this.http.axiosRef.get(
      `${SERVICES.SCRAPED}/searched-products/search/name`,
      { params: { name } }
    );
    return response.data;
  }

  async searchByStore(storeName: string) {
    const response = await this.http.axiosRef.get(
      `${SERVICES.SCRAPED}/searched-products/store/${storeName}`
    );
    return response.data;
  }

  async searchByFilters(filters: ScrapedFilters) {
    const response = await this.http.axiosRef.get(
      `${SERVICES.SCRAPED}/searched-products/search/filters`,
      { params: filters }
    );
    return response.data;
  }

  async getPriceStats(filters: PriceStatsFilters = {}) {
    const response = await this.http.axiosRef.get(
      `${SERVICES.SCRAPED}/searched-products/stats/price`,
      { params: filters }
    );
    return response.data;
  }

  async getPriceSeries(filters: PriceStatsFilters = {}) {
    const response = await this.http.axiosRef.get(
      `${SERVICES.SCRAPED}/searched-products/stats/price-series`,
      { params: filters }
    );
    return response.data;
  }
}
