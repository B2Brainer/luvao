// src/application/dto/scraped-product-response.dto.ts

export class ScrapedProductResponseDto {
  constructor(
    public readonly id: string,
    public readonly storeName: string,
    public readonly query: string,
    public readonly name: string,
    public readonly price: number | null,
    public readonly url: string | null,
    public readonly availability: boolean | null,
    public readonly scrapedAt: Date,
  ) {}
}
