// src/application/dto/update-scraped-product.dto.ts
export class UpdateScrapedProductDto {
  constructor(
    public readonly id: string,
    public readonly price?: number | null,      
    public readonly availability?: boolean | null, 
    public readonly url?: string | null         
  ) {}
}