// /application/mappers/user.mapper.ts
import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';

export const toUserResponseDto = (user: User): UserResponseDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  password: user.password,
});