import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsArray, IsOptional, ArrayMinSize } from 'class-validator';

export class CreateStoreRequestDto {
  @ApiProperty({ example: 'Éxito Buenavista', description: 'Nombre de la tienda' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'https://www.exito.com', description: 'URL base de la tienda' })
  @IsUrl()
  baseUrl!: string;

  @ApiProperty({ example: 'CO', description: 'País de la tienda', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ 
    example: ['arroz', 'aceite', 'huevo'], 
    description: 'Categorías de productos que ofrece la tienda',
    required: false 
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  @IsOptional()
  categories?: string[];
}