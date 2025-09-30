export class Store {
  id?: number;
  name!: string;
  address!: string;
  city!: string;
  website!: string;
  createdAt?: Date;

  constructor(partial: Partial<Store>) {
    Object.assign(this, partial);
  }
}
