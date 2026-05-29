import { HttpService } from '@nestjs/axios';
export declare class CrawlerClient {
    private http;
    constructor(http: HttpService);
    refresh(): Promise<any>;
    getJobStatus(jobId: string): Promise<any>;
}
