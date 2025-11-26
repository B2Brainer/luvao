// /application/services/crawler.service.ts
import { Injectable } from '@nestjs/common';
import { CrawlerClient } from '../clients/crawler.client';
import { ScrapedClient } from '../clients/scraped.client';

@Injectable()
export class CrawlerService {
  constructor(
    private crawlerClient: CrawlerClient,
    private scrapedClient: ScrapedClient
  ) {}

  async refreshScraping() {
    // 1. Ejecutar el refresh del crawler
    const crawlerResult = await this.crawlerClient.refresh();
    
    // 2. Procesar el resultado y hacer bulk replace en scraped service
    if (crawlerResult && crawlerResult.data) {
      await this.scrapedClient.bulkReplaceScrapedProducts(crawlerResult.data);
    }
    
    return crawlerResult;
  }
}