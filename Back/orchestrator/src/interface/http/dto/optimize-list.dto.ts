import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ShoppingListItemDto {
  @ApiProperty({ example: 'arroz' })
  @IsString()
  @IsNotEmpty()
  product!: string;

  @ApiPropertyOptional({ example: 2, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

export class OptimizeListDto {
  @ApiPropertyOptional({ type: [ShoppingListItemDto], description: 'Si se omite, usa todos los productos del catálogo canónico' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShoppingListItemDto)
  items?: ShoppingListItemDto[];

  @ApiPropertyOptional({ example: 30, default: 30, description: 'Periodo de compra en días para la canasta optimizada por calorías' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  periodDays?: number;

  @ApiPropertyOptional({ example: 66000, description: 'Meta calórica total para el periodo. Si se omite se usa 2200 kcal por día.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  targetCalories?: number;
}
