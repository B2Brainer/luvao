export class StoreResponseDto {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly baseUrl: string,
    public readonly country: string,
    public readonly isActive: boolean,
    public readonly categories: string[],
    public readonly createdAt: Date,
  ) {}
}