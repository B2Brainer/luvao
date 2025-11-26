//delete-product.usecase.ts
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';

export class DeleteProductUseCase {
  constructor(private readonly productRepo: ProductRepositoryPort) {}

  async execute(id: string): Promise<void> {
    // Verificar que el producto existe
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    return this.productRepo.delete(id);
  }
}