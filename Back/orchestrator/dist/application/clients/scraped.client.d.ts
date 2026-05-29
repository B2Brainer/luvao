import { HttpService } from '@nestjs/axios';
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
export declare class ScrapedClient {
    private http;
    constructor(http: HttpService);
    searchByQuery(query: string): Promise<any>;
    getAllScrapedProducts(): Promise<any>;
    bulkReplaceScrapedProducts(data: any): Promise<any>;
    searchByAvailability(availability: boolean): Promise<any>;
    searchByName(name: string): Promise<any>;
    searchByStore(storeName: string): Promise<any>;
    searchByFilters(filters: ScrapedFilters): Promise<any>;
    getPriceStats(filters?: PriceStatsFilters): Promise<any>;
    getPriceSeries(filters?: PriceStatsFilters): Promise<any>;
}
export {};
