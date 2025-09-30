import { Module } from '@nestjs/common';
import { UserController } from './interface/user.controller';
import { CreateUserUseCase } from './application/create-user.usecase';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    PrismaUserRepository,
    { provide: 'UserRepository', useExisting: PrismaUserRepository },
  ],
})
export class AppModule {}

