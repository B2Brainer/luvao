import { Injectable } from '@nestjs/common';
import { StoreRepositoryPort } from '../../domain/ports/store.repository.port';
import { StoreEntity } from '../../domain/entities/store.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaStoreRepository implements StoreRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<StoreEntity[]> {
    const stores = await this.prisma.store.findMany({
      where: { isActive: true },
    });

    return stores.map(store => this.toDomain(store));
  }

  async findByCategory(category: string): Promise<StoreEntity[]> {
    const stores = await this.prisma.store.findMany({
      where: {
        isActive: true,
        categories: { has: category },
      },
    });

    return stores.map(store => this.toDomain(store));
  }

  async findById(id: number): Promise<StoreEntity | null> {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });

    return store ? this.toDomain(store) : null;
  }

  async save(store: StoreEntity): Promise<StoreEntity> {
    const saved = await this.prisma.store.create({
      data: {
        name: store.name,
        baseUrl: store.baseUrl,
        country: store.country,
        isActive: store.isActive,
        categories: store.categories,
      },
    });

    return this.toDomain(saved);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.store.count({
      where: { name },
    });

    return count > 0;
  }

  private toDomain(prismaStore: any): StoreEntity {
    return new StoreEntity(
      prismaStore.id,
      prismaStore.name,
      prismaStore.baseUrl,
      prismaStore.country,
      prismaStore.isActive,
      prismaStore.categories,
      prismaStore.createdAt,
    );
  }
}