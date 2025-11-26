// create-product.usecase.ts
import { randomUUID } from 'crypto';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { CreateProductDto } from '../dto/create-product.dto';

export class CreateProductUseCase {
  constructor(private readonly productRepo: ProductRepositoryPort) {}

  async execute(input: CreateProductDto): Promise<Product> {
    // Validación
    const exists = await this.productRepo.existsByName(input.name);
    if (exists) {
      throw new Error('Product with this name already exists');
    }

    // Crear entidad
    const product = new Product(randomUUID(), input.name.toLowerCase().trim());
    
    // Guardar y devolver entidad (NO DTO)
    return this.productRepo.save(product);
  }
}