import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Controller('stores')
export class StoreController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() data: CreateStoreDto) {
    return this.prisma.store.create({ data });
  }

  @Get()
  async findAll() {
    return this.prisma.store.findMany();
  }
}