import { HttpService } from '@nestjs/axios';
export declare class StoresClient {
    private http;
    constructor(http: HttpService);
    getStores(): Promise<any>;
}
