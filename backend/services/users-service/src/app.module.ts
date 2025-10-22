import { Module } from '@nestjs/common';
import { UserController } from './interface/user.controller';
import { ProfileController } from './interface/profile.controller';
import { CreateUserUseCase } from './application/create-user.usecase';
import { UpsertProfileUseCase } from './application/upsert-profile.usecase';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UserController, ProfileController],
  providers: [
    CreateUserUseCase,
    UpsertProfileUseCase,
    PrismaUserRepository,
    { provide: 'UserRepository', useExisting: PrismaUserRepository },
  ],
})
export class AppModule {}

