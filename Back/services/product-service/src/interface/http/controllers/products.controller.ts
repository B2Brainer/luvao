import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetProductsUseCase } from '../../../application/use-cases/get-products.usecase';
import { GetProductByIdUseCase } from '../../../application/use-cases/get-product-by-id.usecase';
import { FilterProductsByTypeUseCase } from '../../../application/use-cases/filter-products-by-type.usecase';
import { CreateProductsUseCase } from '../../../application/use-cases/create-products.usecase';
import { ProductMapper } from '../../../application/mappers/product.mapper';
import { CreateProductRequestDto } from '../dto/create-product-request.dto';
import { GetProductsQueryDto } from '../dto/get-products-query.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface StoreResponse {
  stores?: { id: number; name: string; isActive?: boolean }[];
}

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly filterProductsByTypeUseCase: FilterProductsByTypeUseCase,
    private readonly createProductsUseCase: CreateProductsUseCase,
    private readonly httpService: HttpService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products or filter by type' })
  async getProducts(@Query() query: GetProductsQueryDto) {
    try {
      if (query.type) {
        let products;
        
        if (query.onlyActiveStores) {
          const storeServiceUrl = process.env.SERVICE_STORE_URL || 'http://stores-service:3001';
          const resp = await firstValueFrom(
            this.httpService.get<StoreResponse>(`${storeServiceUrl}/stores`, {
              params: { category: query.type },
            })
          );

          const stores = resp.data.stores || [];
          const storeIds: number[] = stores.map(s => s.id);

          products = await this.filterProductsByTypeUseCase.execute(query.type, storeIds);
        } else {
          products = await this.filterProductsByTypeUseCase.execute(query.type);
        }

        return {
          count: products.length,
          products: ProductMapper.toResponseList(products),
        };
      } else {
        const products = await this.getProductsUseCase.execute();
        return {
          count: products.length,
          products: ProductMapper.toResponseList(products),
        };
      }
    } catch (error) {
      throw new HttpException(
        'Server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id') id: string) {
    try {
      const productId = parseInt(id);
      const product = await this.getProductByIdUseCase.execute(productId);
      
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      return ProductMapper.toResponse(product);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create multiple products' })
  async createProducts(@Body() body: CreateProductRequestDto[]) {
    try {
      if (!Array.isArray(body) || body.length === 0) {
        throw new HttpException(
          'Product list required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.createProductsUseCase.execute(body);
      
      return {
        message: 'Products inserted successfully',
        count: result.count,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}