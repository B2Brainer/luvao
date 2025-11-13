import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class CreateProductsUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(products: CreateProductDto[]): Promise<{ count: number }> {
    const productEntities = products.map(product => 
      ProductMapper.toDomain(product)
    );
    
    return this.productRepository.createMany(productEntities);
  }
}