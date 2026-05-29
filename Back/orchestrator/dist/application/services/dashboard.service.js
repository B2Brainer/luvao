"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const stores_client_1 = require("../clients/stores.client");
const scraped_client_1 = require("../clients/scraped.client");
let DashboardService = class DashboardService {
    storesClient;
    scrapedClient;
    constructor(storesClient, scrapedClient) {
        this.storesClient = storesClient;
        this.scrapedClient = scrapedClient;
    }
    async getDashboard() {
        const [stores, recentProducts] = await Promise.all([
            this.storesClient.getStores(),
            this.scrapedClient.getAllScrapedProducts()
        ]);
        return {
            stores,
            recentProducts
        };
    }
    async getByAvailability(availability) {
        return await this.scrapedClient.searchByAvailability(availability);
    }
    async getByName(name) {
        return await this.scrapedClient.searchByName(name);
    }
    async getByQuery(query) {
        return await this.scrapedClient.searchByQuery(query);
    }
    async getByStore(storeName) {
        return await this.scrapedClient.searchByStore(storeName);
    }
    async getPriceStats(filters) {
        return await this.scrapedClient.getPriceStats(filters);
    }
    async getPriceSeries(filters) {
        return await this.scrapedClient.getPriceSeries(filters);
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stores_client_1.StoresClient,
        scraped_client_1.ScrapedClient])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map