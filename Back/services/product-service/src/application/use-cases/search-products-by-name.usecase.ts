//search-products-by-name.usecase.ts
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';

export class SearchProductsByNameUseCase {
  constructor(private readonly productRepo: ProductRepositoryPort) {}

  async execute(searchTerm: string): Promise<Product[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.productRepo.findAll();
    }
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const allProducts = await this.productRepo.findAll();
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(normalizedSearch)
    );
  }
}