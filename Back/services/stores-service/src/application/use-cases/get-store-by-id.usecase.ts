import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreRepositoryPort } from '../../domain/ports/store.repository.port';
import { StoreResponseDto } from '../dto/store-response.dto';
import { StoreMapper } from '../mappers/store.mapper';

@Injectable()
export class GetStoreByIdUseCase {
  constructor(private readonly storeRepository: StoreRepositoryPort) {}

  async execute(id: number): Promise<StoreResponseDto> {
    const store = await this.storeRepository.findById(id);
    
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return StoreMapper.toResponse(store);
  }
}