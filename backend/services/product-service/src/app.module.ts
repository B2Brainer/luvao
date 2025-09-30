import { Module } from '@nestjs/common';
import { ProductController } from './interface/product.controller';

@Module({
  controllers: [ProductController],
})
export class AppModule {}