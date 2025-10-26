export type StoreEntity = {
  id?: number;
  name: string;
  baseUrl: string;
  country?: string;
  isActive?: boolean;
  categories: string[]; // usamos array en la capa de dominio
  createdAt?: Date;
};
