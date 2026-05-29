import { CrawlerClient } from '../clients/crawler.client';
export declare class CrawlerService {
    private crawlerClient;
    constructor(crawlerClient: CrawlerClient);
    refreshScraping(): Promise<any>;
    getScrapingJobStatus(jobId: string): Promise<any>;
}
