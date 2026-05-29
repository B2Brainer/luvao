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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("../../application/services/auth.service");
const dashboard_service_1 = require("../../application/services/dashboard.service");
const product_service_1 = require("../../application/services/product.service");
const crawler_service_1 = require("../../application/services/crawler.service");
const comparison_service_1 = require("../../application/services/comparison.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const create_product_dto_1 = require("./dto/create-product.dto");
const delete_product_dto_1 = require("./dto/delete-product.dto");
const optimize_list_dto_1 = require("./dto/optimize-list.dto");
const search_by_availability_dto_1 = require("./dto/search-by-availability.dto");
const search_by_name_dto_1 = require("./dto/search-by-name.dto");
let OrchestratorController = class OrchestratorController {
    authService;
    dashboardService;
    productService;
    crawlerService;
    comparisonService;
    constructor(authService, dashboardService, productService, crawlerService, comparisonService) {
        this.authService = authService;
        this.dashboardService = dashboardService;
        this.productService = productService;
        this.crawlerService = crawlerService;
        this.comparisonService = comparisonService;
    }
    async login(dto) {
        return this.authService.login(dto);
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async searchByAvailability(dto) {
        return this.dashboardService.getByAvailability(dto.availability);
    }
    async searchByName(dto) {
        return this.dashboardService.getByName(dto.name);
    }
    async searchByQuery(query) {
        return this.dashboardService.getByQuery(query);
    }
    async searchByStore(storeName) {
        return this.dashboardService.getByStore(storeName);
    }
    async getPriceStats(query, storeName, days) {
        const parsedDays = days ? Number(days) : undefined;
        return this.dashboardService.getPriceStats({
            query,
            storeName,
            days: parsedDays !== undefined && Number.isFinite(parsedDays) ? parsedDays : undefined,
        });
    }
    async getPriceSeries(query, storeName, days) {
        const parsedDays = days ? Number(days) : undefined;
        return this.dashboardService.getPriceSeries({
            query,
            storeName,
            days: parsedDays !== undefined && Number.isFinite(parsedDays) ? parsedDays : undefined,
        });
    }
    async getResearchBasket() {
        return this.comparisonService.getResearchBasket();
    }
    async getProducts() {
        return this.productService.getProductList();
    }
    async createProduct(dto) {
        return this.productService.createProduct(dto);
    }
    async deleteProduct(dto) {
        return this.productService.deleteProductByName(dto.name);
    }
    async refreshScraping() {
        return this.crawlerService.refreshScraping();
    }
    async getScrapingJobStatus(jobId) {
        return this.crawlerService.getScrapingJobStatus(jobId);
    }
    async getDashboard() {
        return this.dashboardService.getDashboard();
    }
    async compareProduct(product) {
        return this.comparisonService.compareByProduct(product);
    }
    async optimizeList(dto) {
        return this.comparisonService.optimizeShoppingList(dto.items, {
            periodDays: dto.periodDays,
            targetCalories: dto.targetCalories,
            restrictedStore: dto.restrictedStore,
        });
    }
};
exports.OrchestratorController = OrchestratorController;
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Iniciar sesión de usuario' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar nuevo usuario' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('search/availability'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar productos por disponibilidad' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_by_availability_dto_1.SearchByAvailabilityDto]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "searchByAvailability", null);
__decorate([
    (0, common_1.Get)('search/name'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar productos por nombre' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_by_name_dto_1.SearchByNameDto]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "searchByName", null);
__decorate([
    (0, common_1.Get)('search/query/:query'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar productos por query' }),
    __param(0, (0, common_1.Param)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "searchByQuery", null);
__decorate([
    (0, common_1.Get)('search/store/:storeName'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar productos por tienda' }),
    __param(0, (0, common_1.Param)('storeName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "searchByStore", null);
__decorate([
    (0, common_1.Get)('stats/price'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadisticas descriptivas de precios' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('storeName')),
    __param(2, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "getPriceStats", null);
__decorate([
    (0, common_1.Get)('stats/price-series'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener serie temporal diaria de precios' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('storeName')),
    __param(2, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "getPriceSeries", null);
__decorate([
    (0, common_1.Get)('research/dane-basket'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener canasta familiar de referencia basada en DANE' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "getResearchBasket", null);
__decorate([
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener lista de nombres de productos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Post)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nuevo producto' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Delete)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar producto por nombre' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delete_product_dto_1.DeleteProductDto]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Post)('refresh-scraping'),
    (0, swagger_1.ApiOperation)({ summary: 'Ejecutar scraping manualmente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "refreshScraping", null);
__decorate([
    (0, common_1.Get)('scraping-jobs/:jobId'),
    (0, swagger_1.ApiOperation)({ summary: 'Consultar estado de job de scraping' }),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "getScrapingJobStatus", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener datos del dashboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('compare/:product'),
    (0, swagger_1.ApiOperation)({ summary: 'Comparar un producto entre tiendas con matching canónico' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ranking comparativo por producto' }),
    __param(0, (0, common_1.Param)('product')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "compareProduct", null);
__decorate([
    (0, common_1.Post)('optimize-list'),
    (0, swagger_1.ApiOperation)({ summary: 'Optimizar lista completa de compras' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Selección sugerida y total estimado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optimize_list_dto_1.OptimizeListDto]),
    __metadata("design:returntype", Promise)
], OrchestratorController.prototype, "optimizeList", null);
exports.OrchestratorController = OrchestratorController = __decorate([
    (0, swagger_1.ApiTags)('orchestrator'),
    (0, common_1.Controller)('orchestrator'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        dashboard_service_1.DashboardService,
        product_service_1.ProductService,
        crawler_service_1.CrawlerService,
        comparison_service_1.ComparisonService])
], OrchestratorController);
//# sourceMappingURL=orchestrator.controller.js.map