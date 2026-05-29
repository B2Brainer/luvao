// /interface/http/orchestrator.controller.ts
import { Body, Controller, Post, Get, Query, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { DashboardService } from '../../application/services/dashboard.service';
import { ProductService } from '../../application/services/product.service'; 
import { CrawlerService } from '../../application/services/crawler.service'; 
import { ComparisonService } from '../../application/services/comparison.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateProductDto } from './dto/create-product.dto'; 
import { DeleteProductDto } from './dto/delete-product.dto';
import { OptimizeListDto } from './dto/optimize-list.dto';
import { SearchByAvailabilityDto } from './dto/search-by-availability.dto';
import { SearchByNameDto } from './dto/search-by-name.dto';

@ApiTags('orchestrator')
@Controller('orchestrator')
export class OrchestratorController {
  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private productService: ProductService, 
    private crawlerService: CrawlerService, 
    private comparisonService: ComparisonService,
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

  @Get('stats/price')
  @ApiOperation({ summary: 'Obtener estadisticas descriptivas de precios' })
  async getPriceStats(
    @Query('query') query?: string,
    @Query('storeName') storeName?: string,
    @Query('days') days?: string,
  ) {
    const parsedDays = days ? Number(days) : undefined;

    return this.dashboardService.getPriceStats({
      query,
      storeName,
      days: parsedDays !== undefined && Number.isFinite(parsedDays) ? parsedDays : undefined,
    });
  }

  @Get('stats/price-series')
  @ApiOperation({ summary: 'Obtener serie temporal diaria de precios' })
  async getPriceSeries(
    @Query('query') query?: string,
    @Query('storeName') storeName?: string,
    @Query('days') days?: string,
  ) {
    const parsedDays = days ? Number(days) : undefined;

    return this.dashboardService.getPriceSeries({
      query,
      storeName,
      days: parsedDays !== undefined && Number.isFinite(parsedDays) ? parsedDays : undefined,
    });
  }

  @Get('research/dane-basket')
  @ApiOperation({ summary: 'Obtener canasta familiar de referencia basada en DANE' })
  async getResearchBasket() {
    return this.comparisonService.getResearchBasket();
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

  @Get('scraping-jobs/:jobId')
  @ApiOperation({ summary: 'Consultar estado de job de scraping' })
  async getScrapingJobStatus(@Param('jobId') jobId: string) {
    return this.crawlerService.getScrapingJobStatus(jobId);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener datos del dashboard' })
  async getDashboard() {
    return this.dashboardService.getDashboard();
  }

  @Get('compare/:product')
  @ApiOperation({ summary: 'Comparar un producto entre tiendas con matching canónico' })
  @ApiResponse({ status: 200, description: 'Ranking comparativo por producto' })
  async compareProduct(@Param('product') product: string) {
    return this.comparisonService.compareByProduct(product);
  }

  @Post('optimize-list')
  @ApiOperation({ summary: 'Optimizar lista completa de compras' })
  @ApiResponse({ status: 200, description: 'Selección sugerida y total estimado' })
  async optimizeList(@Body() dto: OptimizeListDto) {
    return this.comparisonService.optimizeShoppingList(dto.items, {
      periodDays: dto.periodDays,
      targetCalories: dto.targetCalories,
      restrictedStore: dto.restrictedStore,
    });
  }
}
