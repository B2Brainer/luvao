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
exports.ScrapedClient = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const orchestrator_config_1 = require("../../config/orchestrator.config");
let ScrapedClient = class ScrapedClient {
    http;
    constructor(http) {
        this.http = http;
    }
    async searchByQuery(query) {
        const response = await this.http.axiosRef.get(`${orchestrator_config_1.SERVICES.SCRAPED}/searched-products/query/${query}`);
        return response.data;
    }
    async getAllScrapedProducts() {
        const response = await this.http.axiosRef.get(`${orchestrator_config_1.SERVICES.SCRAPED}/searched-products`);
        return response.data;
    }
    async bulkReplaceScrapedProducts(data) {
        const response = await this.http.axiosRef.post(`${orchestrator_config_1.SERVICES.SCRAPED}/searched-products/bulk-replace`, data);
        return response.data;
    }
    async searchByAvailability(availability) {
        const response = await this.http.axiosRef.get(`${orchestrator_config_1.SERVICES.SCRAPED}/searched-products/availability/${availability}`);
        return response.data;
    }
    async searchByName(name) {
        const response = await this.http.axiosRef.get(`${orchestrator_config_1.SERVICES.SCRAPED}/searched-products/search/name`, { params: { name } });
        return response.data;
    }
    async searchByStore(storeName) {
        const response = await this.http.axiosRef.get(`${orchestrator_config_1.SERVICES.SCRAPED}/searched-products/store/${storeName}`);
        return response.data;
    }
    async searchByFilters(filters) {
        const response = await this.http.axiosRef.get(`${orchestrator_config_1.SERVICES.SCRAPED}/searched-products/search/filters`, { params: filters });
        return response.data;
    }
    async getPriceStats(filters = {}) {
        const response = await this.http.axiosRef.get(`${orchestrator_config_1.SERVICES.SCRAPED}/searched-products/stats/price`, { params: filters });
        return response.data;
    }
    async getPriceSeries(filters = {}) {
        const response = await this.http.axiosRef.get(`${orchestrator_config_1.SERVICES.SCRAPED}/searched-products/stats/price-series`, { params: filters });
        return response.data;
    }
};
exports.ScrapedClient = ScrapedClient;
exports.ScrapedClient = ScrapedClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], ScrapedClient);
//# sourceMappingURL=scraped.client.js.map