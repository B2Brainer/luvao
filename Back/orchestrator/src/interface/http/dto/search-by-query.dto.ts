// /interface/http/dto/search-by-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchByQueryDto {
  @ApiProperty({ example: 'arroz integral' })
  @IsString()
  @IsNotEmpty()
  query: string;
}