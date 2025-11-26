//create-store.dto.ts
export class CreateStoreDto {
  constructor(
    public readonly name: string,
    public readonly baseUrl: string,
    public readonly searchPath: string,
  ) {}
}
