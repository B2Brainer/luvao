import { Module } from '@nestjs/common';
import { UserController } from './interface/user.controller';
import { CreateUserUseCase } from './application/create-user.usecase';
import { InMemoryUserRepository } from './infrastructure/persistence/in-memory-user.repository';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    { provide: 'UserRepository', useClass: InMemoryUserRepository },
    InMemoryUserRepository,
  ],
})
export class AppModule {}

