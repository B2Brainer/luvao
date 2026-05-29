import { ProductClient } from '../clients/product.client';
export declare class ProductService {
    private productClient;
    constructor(productClient: ProductClient);
    getProductList(): Promise<any>;
    createProduct(productData: any): Promise<any>;
    deleteProductByName(productName: string): Promise<any>;
}
