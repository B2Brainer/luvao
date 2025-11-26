// /application/services/product.service.ts
import { Injectable } from '@nestjs/common';
import { ProductClient } from '../clients/product.client';

@Injectable()
export class ProductService {
  constructor(private productClient: ProductClient) {}

  async getProductList() {
    return await this.productClient.getProductNames();
  }

  async createProduct(productData: any) {
    return await this.productClient.createProduct(productData);
  }

  async deleteProductByName(productName: string) {
    // 1. Buscar todos los productos para encontrar el que coincide con el nombre
    const allProducts = await this.productClient.getAllProducts();
    
    // 2. Encontrar el producto por nombre (asumiendo que los nombres son únicos)
    const product = allProducts.find(p => 
      p.name.toLowerCase() === productName.toLowerCase().trim()
    );
    
    if (!product) {
      throw new Error(`Product with name "${productName}" not found`);
    }

    // 3. Eliminar el producto usando su ID
    return await this.productClient.deleteProduct(product.id);
  }
}