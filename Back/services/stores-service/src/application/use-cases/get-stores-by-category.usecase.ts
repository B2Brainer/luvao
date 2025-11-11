import { Injectable } from '@nestjs/common';
import { StoreEntity } from '../../domain/entities/store.entity';
import { StoreRepositoryPort } from '../../domain/ports/store.repository.port';
import { StoreResponseDto } from '../dto/store-response.dto';
import { StoreMapper } from '../mappers/store.mapper';

@Injectable()
export class GetStoresByCategoryUseCase {
  constructor(private readonly storeRepository: StoreRepositoryPort) {}

  async execute(category?: string): Promise<StoreResponseDto[]> {
    let stores: StoreEntity[];
    
    if (!category) {
      stores = await this.storeRepository.findAll();
    } else {
      stores = await this.storeRepository.findByCategory(category);
    }

    return StoreMapper.toResponseList(stores);
  }
}