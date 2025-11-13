export class ProductResponseDto {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly type: string,
    public readonly price: number,
    public readonly storeId: number,
    public readonly createdAt: Date,
  ) {}
}