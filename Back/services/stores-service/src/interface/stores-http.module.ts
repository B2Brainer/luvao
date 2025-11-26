//  stores-http.module.ts
import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { STORE_REPOSITORY } from '../application/tokens';
import { PrismaStoreRepository } from '../infrastructure/persistence/prisma-store.repository';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';

import { CreateStoreUseCase } from '../application/use-cases/create-store.usecase';
import { UpdateStoreUseCase } from '../application/use-cases/update-store.usecase';
import { DeleteStoreUseCase } from '../application/use-cases/delete-store.usecase';
import { GetStoreByIdUseCase } from '../application/use-cases/get-store-by-id.usecase';
import { GetAllStoresUseCase } from '../application/use-cases/get-all-stores.usecase';
import { FindStoreByNameUseCase } from '../application/use-cases/find-store-by-name.usecase';
import { GetAllStoreNamesUseCase } from '../application/use-cases/get-all-store-names.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [StoresController],
  providers: [
    // Repository
    {
      provide: STORE_REPOSITORY,
      useFactory: (prisma: PrismaService) => {
        return new PrismaStoreRepository(prisma);
      },
      inject: [PrismaService],
    },

    // Use cases
    {
      provide: CreateStoreUseCase,
      useFactory: (repo) => new CreateStoreUseCase(repo),
      inject: [STORE_REPOSITORY],
    },
    {
      provide: UpdateStoreUseCase,
      useFactory: (repo) => new UpdateStoreUseCase(repo),
      inject: [STORE_REPOSITORY],
    },
    {
      provide: DeleteStoreUseCase,
      useFactory: (repo) => new DeleteStoreUseCase(repo),
      inject: [STORE_REPOSITORY],
    },
    {
      provide: GetStoreByIdUseCase,
      useFactory: (repo) => new GetStoreByIdUseCase(repo),
      inject: [STORE_REPOSITORY],
    },
    {
      provide: GetAllStoresUseCase,
      useFactory: (repo) => new GetAllStoresUseCase(repo),
      inject: [STORE_REPOSITORY],
    },
    {
      provide: FindStoreByNameUseCase,
      useFactory: (repo) => new FindStoreByNameUseCase(repo),
      inject: [STORE_REPOSITORY],
    },
    {
      provide: GetAllStoreNamesUseCase,
      useFactory: (repo) => new GetAllStoreNamesUseCase(repo),
      inject: [STORE_REPOSITORY],
    },
  ],
})
export class StoresHttpModule {}
