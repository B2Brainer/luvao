// /interface/http/users-http.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { USER_REPOSITORY } from '../../application/tokens';
import { PrismaUserRepository } from '../../infrastructure/persistence/prisma-user.repository';
import { CreateUserUseCase } from '../../application/use-cases/create-user.usecase';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.usecase';
import { GetAllUsersUseCase } from '../../application/use-cases/get-all-users.usecase';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.usecase';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.usecase';
import { GetUserByEmailUseCase } from '../../application/use-cases/get-user-by-email.usecase';
import { AuthenticateUserUseCase } from '../../application/use-cases/authenticate-user.usecase';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useFactory: (prisma: PrismaService) => {
        return new PrismaUserRepository(prisma);
      },
      inject: [PrismaService],
    },
    {
      provide: CreateUserUseCase,
      useFactory: (repo) => new CreateUserUseCase(repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: GetUserByIdUseCase,
      useFactory: (repo) => new GetUserByIdUseCase(repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: GetAllUsersUseCase,
      useFactory: (repo) => new GetAllUsersUseCase(repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: UpdateUserUseCase,
      useFactory: (repo) => new UpdateUserUseCase(repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: DeleteUserUseCase,
      useFactory: (repo) => new DeleteUserUseCase(repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: GetUserByEmailUseCase,
      useFactory: (repo) => new GetUserByEmailUseCase(repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: AuthenticateUserUseCase,
      useFactory: (repo) => new AuthenticateUserUseCase(repo),
      inject: [USER_REPOSITORY],
    },
  ],
})
export class UsersHttpModule {}