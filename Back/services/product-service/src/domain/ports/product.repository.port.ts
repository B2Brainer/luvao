// /domain/ports/product.repository.port.ts
import { Product } from '../entities/product.entity';

export interface ProductRepositoryPort {
  // CRUD básico
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Product[]>;
  
  // Busquedas específicas
  findByName(name: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
  getAllProductNames(): Promise<string[]>; 
  
  // Verificación simple
  existsByName(name: string): Promise<boolean>;
}