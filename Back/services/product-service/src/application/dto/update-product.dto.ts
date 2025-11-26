// update-product.dto.ts  
export class UpdateProductDto {
  constructor(
    public readonly id: string,
    public readonly name: string
  ) {}
}