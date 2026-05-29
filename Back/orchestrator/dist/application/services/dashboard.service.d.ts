import { StoresClient } from '../clients/stores.client';
import { ScrapedClient } from '../clients/scraped.client';
export declare class DashboardService {
    private storesClient;
    private scrapedClient;
    constructor(storesClient: StoresClient, scrapedClient: ScrapedClient);
    getDashboard(): Promise<{
        stores: any;
        recentProducts: any;
    }>;
    getByAvailability(availability: boolean): Promise<any>;
    getByName(name: string): Promise<any>;
    getByQuery(query: string): Promise<any>;
    getByStore(storeName: string): Promise<any>;
    getPriceStats(filters: {
        query?: string;
        storeName?: string;
        days?: number;
    }): Promise<any>;
    getPriceSeries(filters: {
        query?: string;
        storeName?: string;
        days?: number;
    }): Promise<any>;
}
