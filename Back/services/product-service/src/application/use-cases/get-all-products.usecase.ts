//get-all-products.usecase.ts
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';

export class GetAllProductsUseCase {
  constructor(private readonly productRepo: ProductRepositoryPort) {}

  async execute(): Promise<Product[]> {
    return this.productRepo.findAll();
  }
}