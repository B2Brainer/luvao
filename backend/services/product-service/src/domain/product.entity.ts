export class Product {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public category: string,
    public price: number,
    public storeId: number,
  ) {}
}