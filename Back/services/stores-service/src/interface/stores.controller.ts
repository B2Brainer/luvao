//  stores.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

import { CreateStoreUseCase } from '../application/use-cases/create-store.usecase';
import { UpdateStoreUseCase } from '../application/use-cases/update-store.usecase';
import { DeleteStoreUseCase } from '../application/use-cases/delete-store.usecase';
import { GetStoreByIdUseCase } from '../application/use-cases/get-store-by-id.usecase';
import { GetAllStoresUseCase } from '../application/use-cases/get-all-stores.usecase';

import { CreateStoreDto } from '../application/dto/create-store.dto';
import { UpdateStoreDto } from '../application/dto/update-store.dto';
import { toStoreResponseDto } from '../application/mappers/store.mapper';

class CreateStoreRequest {
  @ApiProperty({ example: 'Olimpica', description: 'Nombre de la tienda' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'https://www.olimpica.com', description: 'URL base de la tienda' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  baseUrl!: string;

  @ApiProperty({ example: '/api/catalog_system/pub/products/search/', description: 'Ruta interna para consultas' })
  @IsString()
  @IsNotEmpty()
  searchPath!: string;
}

class UpdateStoreRequest {
  @ApiProperty({ example: 'Olimpica Actualizada' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'https://www.olimpica.com' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  baseUrl!: string;

  @ApiProperty({ example: '/api/catalog_system/pub/products/search/' })
  @IsString()
  @IsNotEmpty()
  searchPath!: string;
}

@Controller('stores')
export class StoresController {
  constructor(
    private readonly createStore: CreateStoreUseCase,
    private readonly updateStore: UpdateStoreUseCase,
    private readonly deleteStore: DeleteStoreUseCase,
    private readonly getStoreById: GetStoreByIdUseCase,
    private readonly getAllStores: GetAllStoresUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateStoreRequest) {
    const input = new CreateStoreDto(body.name, body.baseUrl, body.searchPath);
    const store = await this.createStore.execute(input);
    return toStoreResponseDto(store);
  }

  @Get()
  async getAll() {
    const stores = await this.getAllStores.execute();
    return stores.map(toStoreResponseDto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const store = await this.getStoreById.execute(id);
    return store ? toStoreResponseDto(store) : null;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateStoreRequest) {
    const input = new UpdateStoreDto(id, body.name, body.baseUrl, body.searchPath);
    const store = await this.updateStore.execute(input);
    return toStoreResponseDto(store);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteStore.execute(id);
    return { message: 'Store deleted successfully' };
  }
}
