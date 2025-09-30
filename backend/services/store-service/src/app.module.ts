import { Module } from '@nestjs/common';
import { StoreController } from './interface/store.controller'
import { PrismaService } from './infrastructure/prisma.service'
import { RootController } from './interface/root.controller';

@Module({
  controllers: [StoreController, RootController],
  providers: [PrismaService],
})
export class AppModule {}
