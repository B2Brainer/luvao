import { Product } from '../domain/product.entity';
import { ProductRepository } from '../domain/product.repository';

export class CreateProductUseCase {
  constructor(private readonly repo: ProductRepository) {}

  async execute(
    name: string,
    description: string,
    category: string,
    price: number,
    storeId: number
  ): Promise<Product> {
    const product = new Product(0, name, description, category, price, storeId);
    return this.repo.create(product);
  }
}