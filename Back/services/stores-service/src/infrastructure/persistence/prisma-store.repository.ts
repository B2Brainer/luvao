// prisma-store.repository.ts
import { Injectable } from '@nestjs/common';
import { Store } from '../../domain/entities/store.entity';
import { StoreRepositoryPort } from '../../domain/ports/store.repository.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaStoreRepository implements StoreRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(store: Store): Promise<Store> {
    const saved = await this.prisma.store.upsert({
      where: { id: store.id },
      update: {
        name: store.name,
        baseUrl: store.baseUrl,
        searchPath: store.searchPath,
      },
      create: {
        id: store.id,
        name: store.name,
        baseUrl: store.baseUrl,
        searchPath: store.searchPath,
      },
    });

    return new Store(saved.id, saved.name, saved.baseUrl, saved.searchPath);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.store.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Store | null> {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });
    return store
      ? new Store(store.id, store.name, store.baseUrl, store.searchPath)
      : null;
  }

  async findAll(): Promise<Store[]> {
    const stores = await this.prisma.store.findMany();
    return stores.map(
      (s) => new Store(s.id, s.name, s.baseUrl, s.searchPath),
    );
  }

  async findByName(name: string): Promise<Store | null> {
    const store = await this.prisma.store.findFirst({
      where: { name },
    });
    return store
      ? new Store(store.id, store.name, store.baseUrl, store.searchPath)
      : null;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.store.count({
      where: { name },
    });
    return count > 0;
  }

  async getAllStoreNames(): Promise<string[]> {
    const stores = await this.prisma.store.findMany({
      select: { name: true },
    });
    return stores.map((s) => s.name);
  }
}
