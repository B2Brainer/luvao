export class GetStoresByCategoryUseCase {
  storeRepo: any;
  constructor(storeRepo: any) {
    this.storeRepo = storeRepo;
  }

  async execute(category?: string) {
    if (!category) {
      return this.storeRepo.findAll();
    }
    return this.storeRepo.findByCategory(category);
  }
}
