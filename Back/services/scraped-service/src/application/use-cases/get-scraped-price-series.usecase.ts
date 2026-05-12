import { PriceSeriesResponse, PriceStatsFilters, ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';

export class GetScrapedPriceSeriesUseCase {
  constructor(private readonly repo: ScrapedProductRepositoryPort) {}

  async execute(filters: PriceStatsFilters): Promise<PriceSeriesResponse> {
    return this.repo.getPriceSeries(filters);
  }
}
