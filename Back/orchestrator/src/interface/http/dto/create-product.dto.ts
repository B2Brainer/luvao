// /interface/http/dto/create-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Arroz' })
  @IsString()
  @IsNotEmpty()
  name: string;
}