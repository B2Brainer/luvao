import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Param, 
  ParseIntPipe,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiParam,
  ApiBody 
} from '@nestjs/swagger';
import { GetStoresByCategoryUseCase } from '../../../application/use-cases/get-stores-by-category.usecase';
import { GetStoreByIdUseCase } from '../../../application/use-cases/get-store-by-id.usecase';
import { CreateStoreUseCase } from '../../../application/use-cases/create-store.usecase';
import { CreateStoreRequestDto } from '../dto/create-store-request.dto';
import { GetStoresQueryDto } from '../dto/get-stores-query.dto';
import { StoreResponseDto } from '../../../application/dto/store-response.dto';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(
    private readonly getStoresByCategoryUseCase: GetStoresByCategoryUseCase,
    private readonly getStoreByIdUseCase: GetStoreByIdUseCase,
    private readonly createStoreUseCase: CreateStoreUseCase,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todas las tiendas', 
    description: 'Retorna la lista de todas las tiendas activas. Opcionalmente puede filtrar por categoría.' 
  })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de tiendas obtenida exitosamente',
    type: [StoreResponseDto]
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getStores(@Query() query: GetStoresQueryDto): Promise<StoreResponseDto[]> {
    return this.getStoresByCategoryUseCase.execute(query.category);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener tienda por ID', 
    description: 'Retorna los detalles de una tienda específica por su ID.' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la tienda' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tienda encontrada',
    type: StoreResponseDto
  })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getStoreById(@Param('id', ParseIntPipe) id: number): Promise<StoreResponseDto> {
    return this.getStoreByIdUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear nueva tienda', 
    description: 'Crea una nueva tienda en el sistema.' 
  })
  @ApiBody({ type: CreateStoreRequestDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Tienda creada exitosamente',
    type: StoreResponseDto
  })
  @ApiResponse({ status: 409, description: 'Conflicto - Ya existe una tienda con ese nombre' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async createStore(@Body() createStoreDto: CreateStoreRequestDto): Promise<StoreResponseDto> {
    return this.createStoreUseCase.execute({
      name: createStoreDto.name,
      baseUrl: createStoreDto.baseUrl,
      country: createStoreDto.country || 'CO',
      categories: createStoreDto.categories || [],
    });
  }
}