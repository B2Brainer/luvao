// /application/services/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { StoresClient } from '../clients/stores.client';
import { ScrapedClient } from '../clients/scraped.client';

@Injectable()
export class DashboardService {
  constructor(
    private storesClient: StoresClient,
    private scrapedClient: ScrapedClient,
  ) {}

  async getDashboard() {
    const [stores, recentProducts] = await Promise.all([
      this.storesClient.getStores(),
      this.scrapedClient.getAllScrapedProducts() // Productos recientes
    ]);

    return {
      stores,
      recentProducts
    };
  }

  async getByAvailability(availability: boolean) {
    return await this.scrapedClient.searchByAvailability(availability);
  }

  async getByName(name: string) {
    return await this.scrapedClient.searchByName(name);
  }

  async getByQuery(query: string) {
    return await this.scrapedClient.searchByQuery(query);
  }

  async getByStore(storeName: string) {
    return await this.scrapedClient.searchByStore(storeName);
  }
}
