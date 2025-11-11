import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GetStoresQueryDto {
  @ApiProperty({ 
    required: false, 
    example: 'arroz',
    description: 'Filtrar tiendas por categoría' 
  })
  @IsString()
  @IsOptional()
  category?: string;
}