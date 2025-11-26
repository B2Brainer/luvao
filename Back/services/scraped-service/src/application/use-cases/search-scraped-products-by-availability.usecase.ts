// search-scraped-products-by-availability.usecase.ts
import { ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';
import { ScrapedProduct } from '../../domain/entities/scraped-product.entity';

export class SearchScrapedProductsByAvailabilityUseCase {
  constructor(private readonly repo: ScrapedProductRepositoryPort) {}

  async execute(availability: boolean) : Promise<ScrapedProduct[]> {
    return this.repo.findByFilters({ availability });
  }
}
