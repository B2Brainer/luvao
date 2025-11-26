// search-scraped-products-by-name.usecase.ts
import { ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';
import { ScrapedProduct } from '../../domain/entities/scraped-product.entity';

export class SearchScrapedProductsByNameUseCase {
  constructor(private readonly repo: ScrapedProductRepositoryPort) {}

  async execute(name: string) : Promise<ScrapedProduct[]> {
    return this.repo.findByFilters({ name });
  }
}
