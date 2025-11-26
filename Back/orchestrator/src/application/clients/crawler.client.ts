//crawler.client.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SERVICES } from '../../config/orchestrator.config';

@Injectable()
export class CrawlerClient {
  constructor(private http: HttpService) {}

  async refresh() {
    const response = await this.http.axiosRef.post(
      `${SERVICES.CRAWLER}/crawler/refresh`
    );
    return response.data;
  }
}
