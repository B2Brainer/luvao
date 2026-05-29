import { HttpService } from '@nestjs/axios';
export declare class ProductClient {
    private http;
    constructor(http: HttpService);
    getProductNames(): Promise<any>;
    getDaneFamilyBasket(): Promise<any>;
    createProduct(data: any): Promise<any>;
    getAllProducts(): Promise<any>;
    deleteProduct(id: string): Promise<any>;
    searchProductsByName(searchTerm: string): Promise<any>;
}
