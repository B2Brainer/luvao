"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const orchestrator_controller_1 = require("./orchestrator.controller");
const auth_service_1 = require("../../application/services/auth.service");
const dashboard_service_1 = require("../../application/services/dashboard.service");
const product_service_1 = require("../../application/services/product.service");
const crawler_service_1 = require("../../application/services/crawler.service");
const comparison_service_1 = require("../../application/services/comparison.service");
const users_client_1 = require("../../application/clients/users.client");
const product_client_1 = require("../../application/clients/product.client");
const stores_client_1 = require("../../application/clients/stores.client");
const scraped_client_1 = require("../../application/clients/scraped.client");
const crawler_client_1 = require("../../application/clients/crawler.client");
let OrchestratorModule = class OrchestratorModule {
};
exports.OrchestratorModule = OrchestratorModule;
exports.OrchestratorModule = OrchestratorModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        controllers: [orchestrator_controller_1.OrchestratorController],
        providers: [
            auth_service_1.AuthService,
            dashboard_service_1.DashboardService,
            product_service_1.ProductService,
            crawler_service_1.CrawlerService,
            comparison_service_1.ComparisonService,
            users_client_1.UsersClient,
            product_client_1.ProductClient,
            stores_client_1.StoresClient,
            scraped_client_1.ScrapedClient,
            crawler_client_1.CrawlerClient,
        ],
    })
], OrchestratorModule);
//# sourceMappingURL=orchestrator.module.js.map