import { Controller, Post, Body, HttpException, HttpStatus, Get, Query } from '@nestjs/common';
import { CreateUserUseCase } from '../application/create-user.usecase';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  // GET básico → lista de usuarios mock
  @Get()
  async findAll(@Query('email') email?: string) {
    if (email) {
      // Esto es solo un mock; más adelante llamará al repo
      return { id: '1', email };
    }
    return [{ id: '1', email: 'test@test.com' }];
  }

  // POST → crear usuario
  @Post()
  async create(@Body() body: CreateUserDto) {
    try {
      const user = await this.createUserUseCase.execute(body.email, body.password);
      return { id: user.id, email: user.email };
    } catch (err: any) {
      throw new HttpException({ message: err.message }, HttpStatus.BAD_REQUEST);
    }
  }
}


