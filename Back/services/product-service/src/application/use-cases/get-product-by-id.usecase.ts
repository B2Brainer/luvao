import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';

@Injectable()
export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(id: number): Promise<Product | null> {
    return this.productRepository.findById(id);
  }
}