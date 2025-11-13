import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';

@Injectable()
export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(): Promise<Product[]> {
    return this.productRepository.findAll();
  }
}