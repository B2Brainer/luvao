// /interface/http/users.controller.ts
import { Controller, Get, Post, Param, Body, Delete, Put, Query } from '@nestjs/common';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/create-user.usecase';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.usecase';
import { GetAllUsersUseCase } from '../../application/use-cases/get-all-users.usecase';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.usecase';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.usecase';
import { GetUserByEmailUseCase } from '../../application/use-cases/get-user-by-email.usecase';
import { AuthenticateUserUseCase } from '../../application/use-cases/authenticate-user.usecase';
import { toUserResponseDto } from '../../application/mappers/user.mapper';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';

class CreateUserRequest {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Email del usuario', example: 'juan@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'miContraseña123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

class UpdateUserRequest {
  @ApiProperty({ description: 'Nuevo nombre del usuario', example: 'Juan Carlos Pérez' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Nuevo email del usuario', example: 'juancarlos@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Nueva contraseña del usuario', example: 'nuevaContraseña123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

class AuthenticateUserRequest {
  @ApiProperty({ description: 'Email del usuario', example: 'juan@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'miContraseña123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUserById: GetUserByIdUseCase,
    private readonly getAllUsers: GetAllUsersUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
    private readonly getUserByEmail: GetUserByEmailUseCase,
    private readonly authenticateUser: AuthenticateUserUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateUserRequest) {
    const createUserDto = new CreateUserDto(body.name, body.email, body.password);
    const user = await this.createUser.execute(createUserDto);
    return toUserResponseDto(user);
  }

  @Post('authenticate')
  async authenticate(@Body() body: AuthenticateUserRequest) {
    const isAuthenticated = await this.authenticateUser.execute(body.email, body.password);
    return { authenticated: isAuthenticated };
  }

  @Get('email/:email')
  async getByEmail(@Param('email') email: string) {
    const user = await this.getUserByEmail.execute(email);
    return user ? toUserResponseDto(user) : null;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.getUserById.execute(id);
    return user ? toUserResponseDto(user) : null;
  }

  @Get()
  async getAll() {
    const users = await this.getAllUsers.execute();
    return users.map(toUserResponseDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserRequest) {
    const updateUserDto = new UpdateUserDto(id, body.name, body.email, body.password);
    const user = await this.updateUser.execute(updateUserDto);
    return toUserResponseDto(user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteUser.execute(id);
    return { message: 'User deleted successfully' };
  }
}