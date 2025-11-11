export class StoreEntity {
  constructor(
    public readonly id: number,
    public name: string,
    public baseUrl: string,
    public country: string,
    public isActive: boolean,
    public categories: string[],
    public readonly createdAt: Date,
  ) {}

  // Métodos de negocio pueden ir aquí
  static create(
    name: string,
    baseUrl: string,
    country: string = 'CO',
    categories: string[] = [],
  ): StoreEntity {
    return new StoreEntity(
      0, // ID será asignado por la base de datos
      name,
      baseUrl,
      country,
      true, // isActive por defecto
      categories,
      new Date(), // createdAt
    );
  }

  // Validación de negocio
  isValid(): boolean {
    return !!this.name && !!this.baseUrl && this.categories.length >= 0;
  }
}