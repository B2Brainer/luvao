export class FilterProductsByTypeUseCase {
  productRepo: any;
  constructor(productRepo: any) {
    this.productRepo = productRepo;
  }

  // si recibe storeIds, filtra por stores; si no, devuelve todos los products del tipo
  async execute(type: string, storeIds?: number[]) {
    if (storeIds && storeIds.length > 0) {
      return this.productRepo.filterByTypeAndStores(type, storeIds);
    }
    return this.productRepo.filterByType(type);
  }
}
