//store.mapper.ts
import { Store } from '../../domain/entities/store.entity';
import { StoreResponseDto } from '../dto/store-response.dto';

export const toStoreResponseDto = (store: Store): StoreResponseDto => ({
  id: store.id,
  name: store.name,
  baseUrl: store.baseUrl,
  searchPath: store.searchPath,
});
