// product.mapper.ts
import { Product } from '../../domain/entities/product.entity';
import { ProductResponseDto } from '../dto/product-response.dto';

export const toProductResponseDto = (product: Product): ProductResponseDto => ({
  id: product.id,
  name: product.name,
});