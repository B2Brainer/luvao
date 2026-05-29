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
exports.CrawlerClient = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const orchestrator_config_1 = require("../../config/orchestrator.config");
let CrawlerClient = class CrawlerClient {
    http;
    constructor(http) {
        this.http = http;
    }
    async refresh() {
        const response = await this.http.axiosRef.post(`${orchestrator_config_1.SERVICES.CRAWLER}/crawler/refresh`);
        return response.data;
    }
    async getJobStatus(jobId) {
        const response = await this.http.axiosRef.get(`${orchestrator_config_1.SERVICES.CRAWLER}/crawler/jobs/${jobId}`);
        return response.data;
    }
};
exports.CrawlerClient = CrawlerClient;
exports.CrawlerClient = CrawlerClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], CrawlerClient);
//# sourceMappingURL=crawler.client.js.map