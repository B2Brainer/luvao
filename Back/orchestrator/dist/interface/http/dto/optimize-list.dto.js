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
exports.OptimizeListDto = exports.ShoppingListItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ShoppingListItemDto {
    product;
    quantity;
}
exports.ShoppingListItemDto = ShoppingListItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'arroz' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ShoppingListItemDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ShoppingListItemDto.prototype, "quantity", void 0);
class OptimizeListDto {
    items;
    periodDays;
    targetCalories;
    restrictedStore;
}
exports.OptimizeListDto = OptimizeListDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [ShoppingListItemDto], description: 'Si se omite, usa todos los productos del catálogo canónico' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ShoppingListItemDto),
    __metadata("design:type", Array)
], OptimizeListDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30, default: 30, description: 'Periodo de compra en días para la canasta optimizada por calorías' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], OptimizeListDto.prototype, "periodDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 66000, description: 'Meta calórica total para el periodo. Si se omite se usa 2200 kcal por día.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], OptimizeListDto.prototype, "targetCalories", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Olimpica', description: 'Si se envía, restringe la selección principal del optimizador a una sola tienda.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OptimizeListDto.prototype, "restrictedStore", void 0);
//# sourceMappingURL=optimize-list.dto.js.map