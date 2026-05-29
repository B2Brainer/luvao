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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const product_client_1 = require("../clients/product.client");
let ProductService = class ProductService {
    productClient;
    constructor(productClient) {
        this.productClient = productClient;
    }
    async getProductList() {
        return await this.productClient.getProductNames();
    }
    async createProduct(productData) {
        return await this.productClient.createProduct(productData);
    }
    async deleteProductByName(productName) {
        const allProducts = await this.productClient.getAllProducts();
        const product = allProducts.find(p => p.name.toLowerCase() === productName.toLowerCase().trim());
        if (!product) {
            throw new Error(`Product with name "${productName}" not found`);
        }
        return await this.productClient.deleteProduct(product.id);
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [product_client_1.ProductClient])
], ProductService);
//# sourceMappingURL=product.service.js.map