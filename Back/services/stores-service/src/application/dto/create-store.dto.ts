export class CreateStoreDto {
  constructor(
    public readonly name: string,
    public readonly baseUrl: string,
    public readonly country: string,
    public readonly categories: string[],
  ) {}
}