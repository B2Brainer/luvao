import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductUseCase } from '../application/create-product.usecase';
import { InMemoryProductRepository } from '../infrastructure/persistence/in-memory-product.repository';

@Controller('products')
export class ProductController {
  private readonly repo = new InMemoryProductRepository();
  private readonly createUseCase = new CreateProductUseCase(this.repo);

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.createUseCase.execute(
      dto.name,
      dto.description,
      dto.category,
      dto.price,
      dto.storeId
    );
  }

  @Get()
  async findAll() {
    return this.repo.findAll();
  }
}