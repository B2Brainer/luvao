// /interface/http/dto/search-by-availability.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class SearchByAvailabilityDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  availability: boolean;
}