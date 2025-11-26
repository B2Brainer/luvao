// /interface/http/dto/delete-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteProductDto {
  @ApiProperty({ example: 'Arroz' })
  @IsString()
  @IsNotEmpty()
  name: string;
}