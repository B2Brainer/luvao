// /application/use-cases/update-scraped-product.usecase.ts
import { ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';
import { UpdateScrapedProductDto } from '../dto/update-scraped-product.dto';
import { ScrapedProduct } from '../../domain/entities/scraped-product.entity';

export class UpdateScrapedProductUseCase {
  constructor(private readonly repo: ScrapedProductRepositoryPort) {}

  async execute(input: UpdateScrapedProductDto) {
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new Error('Scraped product not found');
    }

    // Crear nueva instancia de ScrapedProduct con los valores actualizados
    const updated = new ScrapedProduct(
      existing.id,
      existing.storeName,
      existing.query,
      existing.name,
      input.price ?? existing.price,        
      input.url ?? existing.url,            
      input.availability ?? existing.availability, 
      existing.scrapedAt
    );

    return this.repo.update(updated);
  }
}
