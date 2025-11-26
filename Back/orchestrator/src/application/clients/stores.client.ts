//product.client.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SERVICES } from '../../config/orchestrator.config';

@Injectable()
export class StoresClient {
  constructor(private http: HttpService) {}

  async getStores() {
    const response = await this.http.axiosRef.get(
      `${SERVICES.STORES}/stores`
    );
    return response.data;
  }
}
