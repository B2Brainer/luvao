// get-all-scraped-products.usecase.ts
import { ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';
import { ScrapedProduct } from '../../domain/entities/scraped-product.entity';

export class GetAllScrapedProductsUseCase {
  constructor(private readonly repo: ScrapedProductRepositoryPort) {}

  async execute(): Promise<ScrapedProduct[]> {
    return this.repo.findAll();
  }
}
