//get-product-names.usecase.ts
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';

export class GetProductNamesUseCase {
  constructor(private readonly productRepo: ProductRepositoryPort) {}

  async execute(): Promise<string[]> {
    return this.productRepo.getAllProductNames();
  }
}