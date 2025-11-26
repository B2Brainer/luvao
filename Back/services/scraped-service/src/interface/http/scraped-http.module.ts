// /interface/http/searched-http.module.ts
import { Module } from '@nestjs/common';
import { SearchedController } from './scraped.controller';
import { SCRAPED_REPOSITORY } from '../../application/tokens';
import { ScrapedProductPrismaRepository } from '../../infrastructure/persistence/scraped-product.prisma.repository';
import { BulkReplaceScrapedProductsUseCase } from '../../application/use-cases/bulk-replace-scraped-products.usecase';
import { GetScrapedProductByIdUseCase } from '../../application/use-cases/get-scraped-product-by-id.usecase';
import { GetAllScrapedProductsUseCase } from '../../application/use-cases/get-all-scraped-products.usecase';
import { UpdateScrapedProductUseCase } from '../../application/use-cases/update-scraped-product.usecase';
import { DeleteScrapedProductUseCase } from '../../application/use-cases/delete-scraped-product.usecase';
import { SearchScrapedProductsByStoreUseCase } from '../../application/use-cases/search-scraped-products-by-store.usecase';
import { SearchScrapedProductsByQueryUseCase } from '../../application/use-cases/search-scraped-products-by-query.usecase';
import { SearchScrapedProductsByNameUseCase } from '../../application/use-cases/search-scraped-products-by-name.usecase';
import { SearchScrapedProductsByAvailabilityUseCase } from '../../application/use-cases/search-scraped-products-by-availability.usecase';
import { SearchScrapedProductsByFiltersUseCase } from '../../application/use-cases/search-scraped-products-by-filters.usecase';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SearchedController],
  providers: [
    {
      provide: SCRAPED_REPOSITORY,
      useFactory: (prisma: PrismaService) => {
        return new ScrapedProductPrismaRepository(prisma);
      },
      inject: [PrismaService],
    },
    {
      provide: BulkReplaceScrapedProductsUseCase,
      useFactory: (repo) => new BulkReplaceScrapedProductsUseCase(repo),
      inject: [SCRAPED_REPOSITORY],
    },
    {
      provide: GetScrapedProductByIdUseCase,
      useFactory: (repo) => new GetScrapedProductByIdUseCase(repo),
      inject: [SCRAPED_REPOSITORY],
    },
    {
      provide: GetAllScrapedProductsUseCase,
      useFactory: (repo) => new GetAllScrapedProductsUseCase(repo),
      inject: [SCRAPED_REPOSITORY],
    },
    {
      provide: UpdateScrapedProductUseCase,
      useFactory: (repo) => new UpdateScrapedProductUseCase(repo),
      inject: [SCRAPED_REPOSITORY],
    },
    {
      provide: DeleteScrapedProductUseCase,
      useFactory: (repo) => new DeleteScrapedProductUseCase(repo),
      inject: [SCRAPED_REPOSITORY],
    },
    {
      provide: SearchScrapedProductsByStoreUseCase,
      useFactory: (repo) => new SearchScrapedProductsByStoreUseCase(repo),
      inject: [SCRAPED_REPOSITORY],
    },
    {
      provide: SearchScrapedProductsByQueryUseCase,
      useFactory: (repo) => new SearchScrapedProductsByQueryUseCase(repo),
      inject: [SCRAPED_REPOSITORY],
    },
    {
      provide: SearchScrapedProductsByNameUseCase,
      useFactory: (repo) => new SearchScrapedProductsByNameUseCase(repo),
      inject: [SCRAPED_REPOSITORY],
    },
    {
      provide: SearchScrapedProductsByAvailabilityUseCase,
      useFactory: (repo) => new SearchScrapedProductsByAvailabilityUseCase(repo),
      inject: [SCRAPED_REPOSITORY],
    },
    {
      provide: SearchScrapedProductsByFiltersUseCase,
      useFactory: (repo) => new SearchScrapedProductsByFiltersUseCase(repo),
      inject: [SCRAPED_REPOSITORY],
    },
  ],
})
export class SearchedHttpModule {}