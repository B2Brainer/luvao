// /application/dto/update-user.dto.ts
export class UpdateUserDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string
  ) {}
}