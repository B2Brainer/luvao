import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';

@Injectable()
export class FilterProductsByTypeUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(type: string, storeIds?: number[]): Promise<Product[]> {
    if (storeIds && storeIds.length > 0) {
      return this.productRepository.filterByTypeAndStores(type, storeIds);
    }
    return this.productRepository.filterByType(type);
  }
}