import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductsController } from './controllers/products.controller';
import { GetProductsUseCase } from '../../application/use-cases/get-products.usecase';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.usecase';
import { FilterProductsByTypeUseCase } from '../../application/use-cases/filter-products-by-type.usecase';
import { CreateProductsUseCase } from '../../application/use-cases/create-products.usecase';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaProductRepository } from '../../infrastructure/persistence/prisma-product.repository';
import { PRODUCT_REPOSITORY } from '../../application/tokens';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [ProductsController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    {
      provide: GetProductsUseCase,
      useFactory: (productRepo) => new GetProductsUseCase(productRepo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: GetProductByIdUseCase,
      useFactory: (productRepo) => new GetProductByIdUseCase(productRepo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: FilterProductsByTypeUseCase,
      useFactory: (productRepo) => new FilterProductsByTypeUseCase(productRepo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: CreateProductsUseCase,
      useFactory: (productRepo) => new CreateProductsUseCase(productRepo),
      inject: [PRODUCT_REPOSITORY],
    },
  ],
})
export class ProductsHttpModule {}