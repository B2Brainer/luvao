// src/application/dto/create-scraped-product.dto.ts
import { ScrapedProduct } from "../../domain/entities/scraped-product.entity";

export class CreateScrapedProductDto {
  constructor(
    public readonly storeName: string,
    public readonly query: string,
    public readonly products: {
      name: string;
      price?: number | null;    
      url?: string | null;      
      availability?: boolean | null;  
    }[]
  ) {}
}
