// /domain/entities/product.entity.ts
export class Product {
  constructor(
    public readonly id: string,
    public name: string
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Product name is required');
    }
    if (name.length > 100) {
      throw new Error('Product name too long');
    }
  }
}