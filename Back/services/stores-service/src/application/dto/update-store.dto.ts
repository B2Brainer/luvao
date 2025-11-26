//update-store.dto.ts
export class UpdateStoreDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly baseUrl: string,
    public readonly searchPath: string,
  ) {}
}
