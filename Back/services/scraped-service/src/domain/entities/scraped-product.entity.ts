// scraped-product.entity.ts
export class ScrapedProduct {
  constructor(
    public readonly id: string,       
    public readonly storeName: string,    
    public readonly query: string,      
    public readonly name: string,          
    public readonly price: number | null,
    public readonly url: string | null,
    public readonly availability: boolean | null,
    public readonly scrapedAt: Date,
  ) {

    if (!storeName?.trim()) {
      throw new Error("storeName is required");
    }

    if (!query?.trim()) {
      throw new Error("query (productName from product-service) is required");
    }

    if (!name?.trim()) {
      throw new Error("name (actual scraped product name) is required");
    }
  }
}
