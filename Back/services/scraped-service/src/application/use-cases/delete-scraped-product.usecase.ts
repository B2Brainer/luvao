// delete-scraped-product.usecase.ts
import { ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';

export class DeleteScrapedProductUseCase {
  constructor(private readonly repo: ScrapedProductRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const exists = await this.repo.findById(id);
    if (!exists) {
      throw new Error('Scraped product not found');
    }
    return this.repo.delete(id);
  }
}
