import { Module } from '@nestjs/common';
import { StoresController } from './http/controllers/stores.controller';
import { GetStoresByCategoryUseCase } from '../application/use-cases/get-stores-by-category.usecase';
import { GetStoreByIdUseCase } from '../application/use-cases/get-store-by-id.usecase';
import { CreateStoreUseCase } from '../application/use-cases/create-store.usecase';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { PrismaStoreRepository } from '../infrastructure/persistence/prisma-store.repository';
import { STORE_REPOSITORY } from '../application/tokens';

@Module({
  imports: [PrismaModule],
  controllers: [StoresController],
  providers: [
    {
      provide: STORE_REPOSITORY,
      useClass: PrismaStoreRepository,
    },
    {
      provide: GetStoresByCategoryUseCase,
      useFactory: (storeRepo) => new GetStoresByCategoryUseCase(storeRepo),
      inject: [STORE_REPOSITORY],
    },
    {
      provide: GetStoreByIdUseCase,
      useFactory: (storeRepo) => new GetStoreByIdUseCase(storeRepo),
      inject: [STORE_REPOSITORY],
    },
    {
      provide: CreateStoreUseCase,
      useFactory: (storeRepo) => new CreateStoreUseCase(storeRepo),
      inject: [STORE_REPOSITORY],
    },
  ],
})
export class StoresHttpModule {}