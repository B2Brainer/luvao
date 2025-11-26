//store-response.dto.ts
export class StoreResponseDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly baseUrl: string,
    public readonly searchPath: string,
  ) {}
}
