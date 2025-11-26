// /interface/http/dto/search-by-store.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchByStoreDto {
  @ApiProperty({ example: 'Éxito' })
  @IsString()
  @IsNotEmpty()
  storeName: string;
}