export type ProductEntity = {
  id?: number;
  name: string;
  type: string;
  storeId: number;
  price: number;
  sku?: string;
  createdAt?: Date;
};
