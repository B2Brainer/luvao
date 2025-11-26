// src/application/use-cases/update-product.usecase.ts
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { UpdateProductDto } from '../dto/update-product.dto';

export class UpdateProductUseCase {
  constructor(private readonly productRepo: ProductRepositoryPort) {}

  async execute(input: UpdateProductDto): Promise<Product> {
    // Verificar que el producto existe
    const existingProduct = await this.productRepo.findById(input.id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Verificar que el nuevo nombre no esté en uso por otro producto
    if (input.name !== existingProduct.name) {
      const nameExists = await this.productRepo.existsByName(input.name);
      if (nameExists) {
        throw new Error('Product name already in use');
      }
    }

    // Actualizar producto
    const updatedProduct = new Product(input.id, input.name.toLowerCase().trim());
    return this.productRepo.save(updatedProduct);
  }
}