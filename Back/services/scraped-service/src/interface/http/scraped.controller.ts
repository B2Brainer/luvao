// /interface/http/searched.controller.ts
import { Controller, Get, Post, Param, Body, Delete, Put, Query } from '@nestjs/common';
import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { BulkReplaceScrapedProductsUseCase } from '../../application/use-cases/bulk-replace-scraped-products.usecase';
import { GetScrapedProductByIdUseCase } from '../../application/use-cases/get-scraped-product-by-id.usecase';
import { GetAllScrapedProductsUseCase } from '../../application/use-cases/get-all-scraped-products.usecase';
import { UpdateScrapedProductUseCase } from '../../application/use-cases/update-scraped-product.usecase';
import { DeleteScrapedProductUseCase } from '../../application/use-cases/delete-scraped-product.usecase';
import { SearchScrapedProductsByStoreUseCase } from '../../application/use-cases/search-scraped-products-by-store.usecase';
import { SearchScrapedProductsByQueryUseCase } from '../../application/use-cases/search-scraped-products-by-query.usecase';
import { SearchScrapedProductsByNameUseCase } from '../../application/use-cases/search-scraped-products-by-name.usecase';
import { SearchScrapedProductsByAvailabilityUseCase } from '../../application/use-cases/search-scraped-products-by-availability.usecase';
import { SearchScrapedProductsByFiltersUseCase } from '../../application/use-cases/search-scraped-products-by-filters.usecase';
import { toScrapedProductResponseDto } from '../../application/mappers/scraped-product.mapper';
import { CreateScrapedProductDto } from '../../application/dto/create-scraped-product.dto';
import { UpdateScrapedProductDto } from '../../application/dto/update-scraped-product.dto';

class ProductItem {
  @ApiProperty({ description: 'Nombre del producto scrapeado', example: 'Arroz Integral 1kg' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Precio del producto', example: 25.99, required: false })
  @IsNumber()
  @IsOptional()
  price?: number | null;

  @ApiProperty({ description: 'URL del producto', example: 'https://tienda.com/arroz-integral', required: false })
  @IsString()
  @IsOptional()
  url?: string | null;

  @ApiProperty({ description: 'Disponibilidad del producto', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  availability?: boolean | null;
}

class CreateScrapedProductRequest {
  @ApiProperty({ description: 'Nombre de la tienda', example: 'supermercado_la_economia' })
  @IsString()
  @IsNotEmpty()
  storeName!: string;

  @ApiProperty({ description: 'Query de búsqueda original', example: 'arroz' })
  @IsString()
  @IsNotEmpty()
  query!: string;

  @ApiProperty({ description: 'Lista de productos scrapeados', type: [ProductItem] })
  @IsArray()
  products!: ProductItem[];
}

class UpdateScrapedProductRequest {
  @ApiProperty({ description: 'Nuevo precio del producto', example: 29.99, required: false })
  @IsNumber()
  @IsOptional()
  price?: number | null;

  @ApiProperty({ description: 'Nueva URL del producto', example: 'https://tienda.com/nueva-url', required: false })
  @IsString()
  @IsOptional()
  url?: string | null;

  @ApiProperty({ description: 'Nueva disponibilidad', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  availability?: boolean | null;
}

@Controller('searched-products')
export class SearchedController {
  constructor(
    private readonly bulkReplaceScrapedProducts: BulkReplaceScrapedProductsUseCase,
    private readonly getScrapedProductById: GetScrapedProductByIdUseCase,
    private readonly getAllScrapedProducts: GetAllScrapedProductsUseCase,
    private readonly updateScrapedProduct: UpdateScrapedProductUseCase,
    private readonly deleteScrapedProduct: DeleteScrapedProductUseCase,
    private readonly searchScrapedProductsByStore: SearchScrapedProductsByStoreUseCase,
    private readonly searchScrapedProductsByQuery: SearchScrapedProductsByQueryUseCase,
    private readonly searchScrapedProductsByName: SearchScrapedProductsByNameUseCase,
    private readonly searchScrapedProductsByAvailability: SearchScrapedProductsByAvailabilityUseCase,
    private readonly searchScrapedProductsByFilters: SearchScrapedProductsByFiltersUseCase,
  ) {}

  @Post('bulk-replace')
  async bulkReplace(@Body() body: CreateScrapedProductRequest) {
    const createScrapedProductDto = new CreateScrapedProductDto(
      body.storeName,
      body.query,
      body.products
    );
    await this.bulkReplaceScrapedProducts.execute(createScrapedProductDto);
    return { message: 'Products replaced successfully' };
  }

  @Get('search/filters')
  async searchByFilters(
    @Query('storeName') storeName?: string,
    @Query('query') query?: string,
    @Query('name') name?: string,
    @Query('availability') availability?: string,
  ) {
    const filters = {
      storeName,
      query,
      name,
      availability: availability ? availability === 'true' : undefined,
    };
    const products = await this.searchScrapedProductsByFilters.execute(filters);
    return products.map(toScrapedProductResponseDto);
  }

  @Get('store/:storeName')
  async getByStore(@Param('storeName') storeName: string) {
    const products = await this.searchScrapedProductsByStore.execute(storeName);
    return products.map(toScrapedProductResponseDto);
  }

  @Get('query/:query')
  async getByQuery(@Param('query') query: string) {
    const products = await this.searchScrapedProductsByQuery.execute(query);
    return products.map(toScrapedProductResponseDto);
  }

  @Get('search/name')
  async searchByName(@Query('name') name: string) {
    const products = await this.searchScrapedProductsByName.execute(name);
    return products.map(toScrapedProductResponseDto);
  }

  @Get('availability/:availability')
  async getByAvailability(@Param('availability') availability: string) {
    const isAvailable = availability === 'true';
    const products = await this.searchScrapedProductsByAvailability.execute(isAvailable);
    return products.map(toScrapedProductResponseDto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const product = await this.getScrapedProductById.execute(id);
    return product ? toScrapedProductResponseDto(product) : null;
  }

  @Get()
  async getAll() {
    const products = await this.getAllScrapedProducts.execute();
    return products.map(toScrapedProductResponseDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateScrapedProductRequest) {
    const updateScrapedProductDto = new UpdateScrapedProductDto(
      id,
      body.price,
      body.availability,
      body.url
    );
    const product = await this.updateScrapedProduct.execute(updateScrapedProductDto);
    return toScrapedProductResponseDto(product);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteScrapedProduct.execute(id);
    return { message: 'Scraped product deleted successfully' };
  }
}