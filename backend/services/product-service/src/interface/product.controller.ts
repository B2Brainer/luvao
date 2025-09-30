import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductUseCase } from '../application/create-product.usecase';
import { InMemoryProductRepository } from '../infrastructure/persistence/in-memory-product.repository';

@Controller() // Quitamos 'products' para que las rutas raíz funcionen
export class ProductController {
  private readonly repo = new InMemoryProductRepository();
  private readonly createUseCase = new CreateProductUseCase(this.repo);

  // Ruta raíz
  @Get()
  getHello() {
    return { message: 'Product Service funcionando correctamente' };
  }

  // Ruta de productos
  @Get('products')
  async findAll() {
    return this.repo.findAll();
  }

  @Post('products')
  async create(@Body() dto: CreateProductDto) {
    return this.createUseCase.execute(
      dto.name,
      dto.description,
      dto.category,
      dto.price,
      dto.storeId
    );
  }
}