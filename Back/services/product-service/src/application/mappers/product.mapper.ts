import { Product } from '../../domain/entities/product.entity';
import { ProductResponseDto } from '../dto/product-response.dto';
import { CreateProductDto } from '../dto/create-product.dto';

export class ProductMapper {
  static toDomain(createDto: CreateProductDto): Product {
    return Product.create(
      createDto.name,
      createDto.type,
      createDto.price,
      createDto.storeId,
    );
  }

  static toResponse(product: Product): ProductResponseDto {
    return new ProductResponseDto(
      product.id,
      product.name,
      product.type,
      product.price,
      product.storeId,
      product.createdAt,
    );
  }

  static toResponseList(products: Product[]): ProductResponseDto[] {
    return products.map(product => this.toResponse(product));
  }
}