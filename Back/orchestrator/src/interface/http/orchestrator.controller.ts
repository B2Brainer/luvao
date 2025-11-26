// /interface/http/orchestrator.controller.ts
import { Body, Controller, Post, Get, Query, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { DashboardService } from '../../application/services/dashboard.service';
import { ProductService } from '../../application/services/product.service'; 
import { CrawlerService } from '../../application/services/crawler.service'; 
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateProductDto } from './dto/create-product.dto'; 
import { DeleteProductDto } from './dto/delete-product.dto';
import { SearchByAvailabilityDto } from './dto/search-by-availability.dto';
import { SearchByNameDto } from './dto/search-by-name.dto';
import { SearchByQueryDto } from './dto/search-by-query.dto';
import { SearchByStoreDto } from './dto/search-by-store.dto';

@ApiTags('orchestrator')
@Controller('orchestrator')
export class OrchestratorController {
  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private productService: ProductService, 
    private crawlerService: CrawlerService, 
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('search/availability')
  @ApiOperation({ summary: 'Buscar productos por disponibilidad' })
  async searchByAvailability(@Query() dto: SearchByAvailabilityDto) {
    return this.dashboardService.getByAvailability(dto.availability);
  }

  @Get('search/name')
  @ApiOperation({ summary: 'Buscar productos por nombre' })
  async searchByName(@Query() dto: SearchByNameDto) {
    return this.dashboardService.getByName(dto.name);
  }

  @Get('search/query/:query')
  @ApiOperation({ summary: 'Buscar productos por query' })
  async searchByQuery(@Param('query') query: string) {
    return this.dashboardService.getByQuery(query);
  }

  @Get('search/store/:storeName')
  @ApiOperation({ summary: 'Buscar productos por tienda' })
  async searchByStore(@Param('storeName') storeName: string) {
    return this.dashboardService.getByStore(storeName);
  }

  @Get('products')
  @ApiOperation({ summary: 'Obtener lista de nombres de productos' })
  async getProducts() {
    return this.productService.getProductList();
  }

  @Post('products')
  @ApiOperation({ summary: 'Crear nuevo producto' })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Delete('products')
  @ApiOperation({ summary: 'Eliminar producto por nombre' })
  async deleteProduct(@Body() dto: DeleteProductDto) {
    return this.productService.deleteProductByName(dto.name);
  }

  @Post('refresh-scraping')
  @ApiOperation({ summary: 'Ejecutar scraping manualmente' })
  async refreshScraping() {
    return this.crawlerService.refreshScraping();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener datos del dashboard' })
  async getDashboard() {
    return this.dashboardService.getDashboard();
  }
}
