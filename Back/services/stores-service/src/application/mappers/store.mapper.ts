import { StoreEntity } from '../../domain/entities/store.entity';
import { CreateStoreDto } from '../dto/create-store.dto';
import { StoreResponseDto } from '../dto/store-response.dto';

export class StoreMapper {
  static toDomain(createDto: CreateStoreDto): StoreEntity {
    return StoreEntity.create(
      createDto.name,
      createDto.baseUrl,
      createDto.country,
      createDto.categories,
    );
  }

  static toResponse(entity: StoreEntity): StoreResponseDto {
    return new StoreResponseDto(
      entity.id,
      entity.name,
      entity.baseUrl,
      entity.country,
      entity.isActive,
      entity.categories,
      entity.createdAt,
    );
  }

  static toResponseList(entities: StoreEntity[]): StoreResponseDto[] {
    return entities.map(entity => this.toResponse(entity));
  }
}