// /interface/http/dto/product-list.dto.ts
// Este DTO es para la respuesta, no necesita validaciones
import { ApiProperty } from '@nestjs/swagger';

export class ProductListDto {
  @ApiProperty({ example: ['Arroz', 'Aceite', 'Azúcar'] })
  products: string[];
}
