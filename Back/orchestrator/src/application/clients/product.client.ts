// /application/clients/product.client.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SERVICES } from '../../config/orchestrator.config';

@Injectable()
export class ProductClient {
  constructor(private http: HttpService) {}

  async getProductNames() {
    const response = await this.http.axiosRef.get(
      `${SERVICES.PRODUCT}/products/names`
    );
    return response.data;
  }

  async createProduct(data: any) {
    const response = await this.http.axiosRef.post(
      `${SERVICES.PRODUCT}/products`,
      data
    );
    return response.data;
  }

  async getAllProducts() {
    const response = await this.http.axiosRef.get(
      `${SERVICES.PRODUCT}/products`
    );
    return response.data;
  }

  async deleteProduct(id: string) {
    const response = await this.http.axiosRef.delete(
      `${SERVICES.PRODUCT}/products/${id}`
    );
    return response.data;
  }

  async searchProductsByName(searchTerm: string) {
    const response = await this.http.axiosRef.get(
      `${SERVICES.PRODUCT}/products/search/${encodeURIComponent(searchTerm)}`
    );
    return response.data;
  }
}