import { HttpService } from '@nestjs/axios';
export declare class UsersClient {
    private http;
    constructor(http: HttpService);
    authenticateUser(email: string, password: string): Promise<any>;
    createUser(data: any): Promise<any>;
    updateUser(id: string, data: any): Promise<any>;
    getUserByEmail(email: string): Promise<any>;
    private withRetry;
    private isRetryable;
    private wait;
}
