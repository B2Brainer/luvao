import { PriceStatsFilters, PriceStatsResponse, ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';

export class GetScrapedPriceStatsUseCase {
  constructor(private readonly repo: ScrapedProductRepositoryPort) {}

  async execute(filters: PriceStatsFilters): Promise<PriceStatsResponse> {
    return this.repo.getPriceStats(filters);
  }
}
