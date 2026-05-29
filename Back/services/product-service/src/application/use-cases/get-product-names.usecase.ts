//get-product-names.usecase.ts
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { DANE_FAMILY_BASKET } from './get-dane-family-basket.usecase';

export class GetProductNamesUseCase {
  constructor(private readonly productRepo: ProductRepositoryPort) {}

  async execute(): Promise<string[]> {
    return DANE_FAMILY_BASKET.map((item) => item.product);
  }
}
