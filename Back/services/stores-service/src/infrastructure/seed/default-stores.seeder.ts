import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_STORES = [
  {
    key: 'olimpica',
    name: 'Olímpica',
    baseUrl: 'https://www.olimpica.com',
    searchPath: '/api/catalog_system/pub/products/search/',
  },
  {
    key: 'exito',
    name: 'Éxito',
    baseUrl: 'https://www.exito.com',
    searchPath: '/io/api/catalog_system/pub/products/search/',
  },
  {
    key: 'carulla',
    name: 'Carulla',
    baseUrl: 'https://www.carulla.com',
    searchPath: '/io/api/catalog_system/pub/products/search/',
  },
  {
    key: 'd1',
    name: 'D1',
    baseUrl: 'https://domicilios.tiendasd1.com',
    searchPath: '/search?name=',
  },
] as const;

const normalizeStoreName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

@Injectable()
export class DefaultStoresSeeder implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const existingStores = await this.prisma.store.findMany();

    for (const store of DEFAULT_STORES) {
      const existing = existingStores.find((candidate) =>
        normalizeStoreName(candidate.name).includes(store.key),
      );
      const data = {
        baseUrl: store.baseUrl,
        searchPath: store.searchPath,
      };

      if (existing) {
        await this.prisma.store.update({
          where: { id: existing.id },
          data,
        });
        continue;
      }

      await this.prisma.store.create({
        data: {
          name: store.name,
          ...data,
        },
      });
    }
  }
}
