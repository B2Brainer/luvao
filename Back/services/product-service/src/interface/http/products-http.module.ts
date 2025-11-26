// products-http.module.ts
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { PRODUCT_REPOSITORY } from '../../application/tokens';
import { PrismaProductRepository } from '../../infrastructure/persistence/prisma-product.repository';
import { CreateProductUseCase } from '../../application/use-cases/create-product.usecase';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.usecase';
import { GetAllProductsUseCase } from '../../application/use-cases/get-all-products.usecase';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.usecase';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.usecase';
import { GetProductNamesUseCase } from '../../application/use-cases/get-product-names.usecase';
import { SearchProductsByNameUseCase } from '../../application/use-cases/search-products-by-name.usecase';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

const usePrisma = !!process.env.DATABASE_URL;

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useFactory: (prisma: PrismaService) => {
        return new PrismaProductRepository(prisma);
      },
      inject: [PrismaService],
    },
    {
      provide: CreateProductUseCase,
      useFactory: (repo) => new CreateProductUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: GetProductByIdUseCase,
      useFactory: (repo) => new GetProductByIdUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: GetAllProductsUseCase,
      useFactory: (repo) => new GetAllProductsUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: UpdateProductUseCase,
      useFactory: (repo) => new UpdateProductUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: DeleteProductUseCase,
      useFactory: (repo) => new DeleteProductUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: GetProductNamesUseCase,
      useFactory: (repo) => new GetProductNamesUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: SearchProductsByNameUseCase,
      useFactory: (repo) => new SearchProductsByNameUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
  ],
})
export class ProductsHttpModule {}