// src/application/use-cases/get-product-by-id.usecase.ts
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';

export class GetProductByIdUseCase {
  constructor(private readonly productRepo: ProductRepositoryPort) {}

  async execute(id: string): Promise<Product | null> {
    return this.productRepo.findById(id);
  }
}