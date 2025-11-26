// src/application/mappers/scraped-product.mapper.ts

import { ScrapedProduct } from "../../domain/entities/scraped-product.entity";
import { ScrapedProductResponseDto } from "../dto/scraped-product-response.dto";

export const toScrapedProductResponseDto = (
  product: ScrapedProduct
): ScrapedProductResponseDto => ({
  id: product.id,
  storeName: product.storeName,
  query: product.query,
  name: product.name,
  price: product.price,
  url: product.url,
  availability: product.availability,
  scrapedAt: product.scrapedAt,
});
