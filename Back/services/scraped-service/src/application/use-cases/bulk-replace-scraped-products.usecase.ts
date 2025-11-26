// /application/use-cases/bulk-replace-scraped-products.usecase.ts
import { ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';
import { CreateScrapedProductDto } from '../dto/create-scraped-product.dto';
import { randomUUID } from 'crypto';
import { ScrapedProduct } from '../../domain/entities/scraped-product.entity';

export class BulkReplaceScrapedProductsUseCase {
  constructor(private readonly repo: ScrapedProductRepositoryPort) {}

  async execute(input: CreateScrapedProductDto): Promise<void> {
    const products = input.products.map(p => 
      new ScrapedProduct(
        randomUUID(),
        input.storeName,
        input.query,
        p.name,
        p.price ?? null,        
        p.url ?? null,          
        p.availability ?? null, 
        new Date()
      )
    );

    return this.repo.bulkReplace(input.storeName, input.query, products);
  }
}
