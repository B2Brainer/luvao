// /application/services/crawler.service.ts
import { Injectable } from '@nestjs/common';
import { CrawlerClient } from '../clients/crawler.client';

@Injectable()
export class CrawlerService {
  constructor(
    private crawlerClient: CrawlerClient,
  ) {}

  async refreshScraping() {
    // El crawler ya persiste resultados en scraped-service.
    // El orchestrator solo debe disparar el proceso y devolver su resultado.
    return this.crawlerClient.refresh();
  }

  async getScrapingJobStatus(jobId: string) {
    return this.crawlerClient.getJobStatus(jobId);
  }
}