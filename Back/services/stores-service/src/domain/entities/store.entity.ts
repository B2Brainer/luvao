// src/domain/entities/store.entity.ts
export class Store {
  constructor(
    public readonly id: string,
    public name: string,
    public baseUrl: string,
    public searchPath: string,
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Store name is required');
    }

    if (!baseUrl || !baseUrl.startsWith('http')) {
      throw new Error('Store baseUrl must be a valid URL');
    }

    if (!searchPath || searchPath.trim().length === 0) {
      throw new Error('Store searchPath is required');
    }
  }
}
