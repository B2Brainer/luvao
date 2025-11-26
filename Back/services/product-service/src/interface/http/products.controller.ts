// products.controller.ts
import { Controller, Get, Post, Param, Body, Delete, Put, Query } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { CreateProductUseCase } from '../../application/use-cases/create-product.usecase';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.usecase';
import { GetAllProductsUseCase } from '../../application/use-cases/get-all-products.usecase';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.usecase';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.usecase';
import { GetProductNamesUseCase } from '../../application/use-cases/get-product-names.usecase';
import { SearchProductsByNameUseCase } from '../../application/use-cases/search-products-by-name.usecase';
import { toProductResponseDto } from '../../application/mappers/product.mapper';
import { CreateProductDto } from '../../application/dto/create-product.dto';
import { UpdateProductDto } from '../../application/dto/update-product.dto';

class CreateProductRequest {
  @ApiProperty({ description: 'Nombre del producto', example: 'arroz' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

class UpdateProductRequest {
  @ApiProperty({ description: 'Nuevo nombre del producto', example: 'arroz integral' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly getProductById: GetProductByIdUseCase,
    private readonly getAllProducts: GetAllProductsUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
    private readonly getProductNames: GetProductNamesUseCase,
    private readonly searchProductsByName: SearchProductsByNameUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateProductRequest) {
    const createProductDto = new CreateProductDto(body.name);
    const product = await this.createProduct.execute(createProductDto);
    return toProductResponseDto(product);
  }

  @Get('names')
  async getNames() {
    return this.getProductNames.execute();
  }

  @Get('search')
  async search(@Query('q') query: string) {
    const products = await this.searchProductsByName.execute(query);
    return products.map(toProductResponseDto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const product = await this.getProductById.execute(id);
    return product ? toProductResponseDto(product) : null;
  }

  @Get()
  async getAll() {
    const products = await this.getAllProducts.execute();
    return products.map(toProductResponseDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateProductRequest) {
    const updateProductDto = new UpdateProductDto(id, body.name);
    const product = await this.updateProduct.execute(updateProductDto);
    return toProductResponseDto(product);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteProduct.execute(id);
    return { message: 'Product deleted successfully' };
  }
}