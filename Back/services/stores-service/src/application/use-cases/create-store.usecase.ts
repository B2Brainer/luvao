import { Injectable, ConflictException } from '@nestjs/common';
import { StoreRepositoryPort } from '../../domain/ports/store.repository.port';
import { CreateStoreDto } from '../dto/create-store.dto';
import { StoreResponseDto } from '../dto/store-response.dto';
import { StoreMapper } from '../mappers/store.mapper';

@Injectable()
export class CreateStoreUseCase {
  constructor(private readonly storeRepository: StoreRepositoryPort) {}

  async execute(createStoreDto: CreateStoreDto): Promise<StoreResponseDto> {
    // Verificar si ya existe una tienda con el mismo nombre
    const exists = await this.storeRepository.existsByName(createStoreDto.name);
    if (exists) {
      throw new ConflictException(`Store with name '${createStoreDto.name}' already exists`);
    }

    // Mapear DTO a entidad de dominio
    const storeEntity = StoreMapper.toDomain(createStoreDto);

    // Validar la entidad
    if (!storeEntity.isValid()) {
      throw new Error('Invalid store data');
    }

    // Guardar en el repositorio
    const savedStore = await this.storeRepository.save(storeEntity);

    // Retornar DTO de respuesta
    return StoreMapper.toResponse(savedStore);
  }
}