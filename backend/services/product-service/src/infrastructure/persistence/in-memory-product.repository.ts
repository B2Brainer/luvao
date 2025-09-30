import { ProductRepository } from '../../domain/product.repository';
import { Product } from '../../domain/product.entity';

export class InMemoryProductRepository implements ProductRepository {
  private products: Product[] = [];

  async create(product: Product): Promise<Product> {
    product.id = this.products.length + 1;
    this.products.push(product);
    return product;
  }

  async findAll(): Promise<Product[]> {
    return this.products;
  }
}