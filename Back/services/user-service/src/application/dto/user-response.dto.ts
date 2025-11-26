// /application/dto/user-response.dto.ts
export class UserResponseDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string
  ) {}
}