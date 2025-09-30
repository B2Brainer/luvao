import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma.service';
import { Store } from '../domain/entities/store.entity';
import { CreateStoreDto } from '../interface/dto/create-store.dto';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateStoreDto): Promise<Store> {
    const store = await this.prisma.store.create({ data });
    return new Store(store);
  }

  async findAll(): Promise<Store[]> {
    const stores = await this.prisma.store.findMany();
    return stores.map(() => new Store(stores));
  }
}
