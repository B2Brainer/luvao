// get-scraped-product-by-id.usecase.ts
import { ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';
import { ScrapedProduct } from '../../domain/entities/scraped-product.entity';

export class GetScrapedProductByIdUseCase {
  constructor(private readonly repo: ScrapedProductRepositoryPort) {}

  async execute(id: string): Promise<ScrapedProduct | null> {
    return this.repo.findById(id);
  }
}
