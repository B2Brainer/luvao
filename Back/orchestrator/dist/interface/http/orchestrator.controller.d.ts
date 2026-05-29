import { AuthService } from '../../application/services/auth.service';
import { DashboardService } from '../../application/services/dashboard.service';
import { ProductService } from '../../application/services/product.service';
import { CrawlerService } from '../../application/services/crawler.service';
import { ComparisonService } from '../../application/services/comparison.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { DeleteProductDto } from './dto/delete-product.dto';
import { OptimizeListDto } from './dto/optimize-list.dto';
import { SearchByAvailabilityDto } from './dto/search-by-availability.dto';
import { SearchByNameDto } from './dto/search-by-name.dto';
export declare class OrchestratorController {
    private authService;
    private dashboardService;
    private productService;
    private crawlerService;
    private comparisonService;
    constructor(authService: AuthService, dashboardService: DashboardService, productService: ProductService, crawlerService: CrawlerService, comparisonService: ComparisonService);
    login(dto: LoginDto): Promise<any>;
    register(dto: RegisterDto): Promise<any>;
    searchByAvailability(dto: SearchByAvailabilityDto): Promise<any>;
    searchByName(dto: SearchByNameDto): Promise<any>;
    searchByQuery(query: string): Promise<any>;
    searchByStore(storeName: string): Promise<any>;
    getPriceStats(query?: string, storeName?: string, days?: string): Promise<any>;
    getPriceSeries(query?: string, storeName?: string, days?: string): Promise<any>;
    getResearchBasket(): Promise<{
        product: string;
        quantity: number;
        category?: string;
        unit?: string | null;
    }[]>;
    getProducts(): Promise<any>;
    createProduct(dto: CreateProductDto): Promise<any>;
    deleteProduct(dto: DeleteProductDto): Promise<any>;
    refreshScraping(): Promise<any>;
    getScrapingJobStatus(jobId: string): Promise<any>;
    getDashboard(): Promise<{
        stores: any;
        recentProducts: any;
    }>;
    compareProduct(product: string): Promise<{
        product: string;
        canonicalProduct: string[];
        comparedCount: number;
        bestByStore: ({
            id: string;
            storeName: string;
            sourceName: string;
            query: string;
            price: number | null;
            availability: boolean;
            url: string | null;
            scrapedAt?: string;
            normalizedName: string;
            canonicalTokens: string[];
            presentation: {
                amount: number | null;
                unit: string | null;
                label: string | null;
                baseAmount: number | null;
                baseUnit: string | null;
            };
            nutrition: {
                calories: number | null;
                caloriesPerBaseUnit: number | null;
                calorieBaseUnit: string | null;
                label: string | null;
                source: "estimated" | null;
            };
            pricePerUnit: number | null;
            pricePerCalorie: number | null;
        } & {
            relevanceScore: number;
            matchScore: number;
        })[];
        ranking: ({
            id: string;
            storeName: string;
            sourceName: string;
            query: string;
            price: number | null;
            availability: boolean;
            url: string | null;
            scrapedAt?: string;
            normalizedName: string;
            canonicalTokens: string[];
            presentation: {
                amount: number | null;
                unit: string | null;
                label: string | null;
                baseAmount: number | null;
                baseUnit: string | null;
            };
            nutrition: {
                calories: number | null;
                caloriesPerBaseUnit: number | null;
                calorieBaseUnit: string | null;
                label: string | null;
                source: "estimated" | null;
            };
            pricePerUnit: number | null;
            pricePerCalorie: number | null;
        } & {
            relevanceScore: number;
            matchScore: number;
        })[];
        bestOverall: {
            id: string;
            storeName: string;
            sourceName: string;
            query: string;
            price: number | null;
            availability: boolean;
            url: string | null;
            scrapedAt?: string;
            normalizedName: string;
            canonicalTokens: string[];
            presentation: {
                amount: number | null;
                unit: string | null;
                label: string | null;
                baseAmount: number | null;
                baseUnit: string | null;
            };
            nutrition: {
                calories: number | null;
                caloriesPerBaseUnit: number | null;
                calorieBaseUnit: string | null;
                label: string | null;
                source: "estimated" | null;
            };
            pricePerUnit: number | null;
            pricePerCalorie: number | null;
        } & {
            relevanceScore: number;
            matchScore: number;
        };
    }>;
    optimizeList(dto: OptimizeListDto): Promise<{
        mode: string;
        computedAt: string;
        restrictedStore: string | null;
        periodDays: number;
        targetCalories: number;
        targetRangeCalories: {
            min: number;
            max: number;
        };
        plannedCalories: number;
        categoryTargets: {
            category: string;
            share: number;
            targetCalories: number;
            plannedCalories: number;
        }[];
        requestedItems: number;
        resolvedItems: number;
        unresolvedItems: string[];
        totalEstimated: number;
        estimatedByStore: Record<string, number>;
        storeScenarios: {
            storeName: string;
            totalEstimated: number;
            resolvedItems: number;
            requestedItems: number;
            unresolvedItems: string[];
            coverage: number;
            plannedCalories: number;
            targetCalories: number;
        }[];
        lines: {
            requested: string;
            category: string;
            quantity: number;
            targetTokens: string[];
            optionsByStore: ({
                id: string;
                storeName: string;
                sourceName: string;
                query: string;
                price: number | null;
                availability: boolean;
                url: string | null;
                scrapedAt?: string;
                normalizedName: string;
                canonicalTokens: string[];
                presentation: {
                    amount: number | null;
                    unit: string | null;
                    label: string | null;
                    baseAmount: number | null;
                    baseUnit: string | null;
                };
                nutrition: {
                    calories: number | null;
                    caloriesPerBaseUnit: number | null;
                    calorieBaseUnit: string | null;
                    label: string | null;
                    source: "estimated" | null;
                };
                pricePerUnit: number | null;
                pricePerCalorie: number | null;
            } & {
                relevanceScore: number;
                matchScore: number;
            })[];
            selected: ({
                id: string;
                storeName: string;
                sourceName: string;
                query: string;
                price: number | null;
                availability: boolean;
                url: string | null;
                scrapedAt?: string;
                normalizedName: string;
                canonicalTokens: string[];
                presentation: {
                    amount: number | null;
                    unit: string | null;
                    label: string | null;
                    baseAmount: number | null;
                    baseUnit: string | null;
                };
                nutrition: {
                    calories: number | null;
                    caloriesPerBaseUnit: number | null;
                    calorieBaseUnit: string | null;
                    label: string | null;
                    source: "estimated" | null;
                };
                pricePerUnit: number | null;
                pricePerCalorie: number | null;
            } & {
                relevanceScore: number;
                matchScore: number;
            }) | null;
            caloriesPerPackage: number | null;
            targetCalories: number | null;
            plannedCalories: number | null;
            subtotal: number | null;
        }[];
    } | {
        mode: string;
        computedAt: string;
        restrictedStore: string | null;
        requestedItems: number;
        resolvedItems: number;
        unresolvedItems: string[];
        totalEstimated: number;
        estimatedByStore: Record<string, number>;
        storeScenarios: never[];
        lines: {
            requested: string;
            quantity: number;
            targetTokens: string[];
            optionsByStore: ({
                id: string;
                storeName: string;
                sourceName: string;
                query: string;
                price: number | null;
                availability: boolean;
                url: string | null;
                scrapedAt?: string;
                normalizedName: string;
                canonicalTokens: string[];
                presentation: {
                    amount: number | null;
                    unit: string | null;
                    label: string | null;
                    baseAmount: number | null;
                    baseUnit: string | null;
                };
                nutrition: {
                    calories: number | null;
                    caloriesPerBaseUnit: number | null;
                    calorieBaseUnit: string | null;
                    label: string | null;
                    source: "estimated" | null;
                };
                pricePerUnit: number | null;
                pricePerCalorie: number | null;
            } & {
                relevanceScore: number;
                matchScore: number;
            })[];
            selected: {
                id: string;
                storeName: string;
                sourceName: string;
                query: string;
                price: number | null;
                availability: boolean;
                url: string | null;
                scrapedAt?: string;
                normalizedName: string;
                canonicalTokens: string[];
                presentation: {
                    amount: number | null;
                    unit: string | null;
                    label: string | null;
                    baseAmount: number | null;
                    baseUnit: string | null;
                };
                nutrition: {
                    calories: number | null;
                    caloriesPerBaseUnit: number | null;
                    calorieBaseUnit: string | null;
                    label: string | null;
                    source: "estimated" | null;
                };
                pricePerUnit: number | null;
                pricePerCalorie: number | null;
            } & {
                relevanceScore: number;
                matchScore: number;
            };
            caloriesPerPackage: number | null;
            plannedCalories: number | null;
            subtotal: number | null;
        }[];
    }>;
}
