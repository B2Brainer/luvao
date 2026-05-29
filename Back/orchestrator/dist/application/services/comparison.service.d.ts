import { ProductClient } from '../clients/product.client';
import { ScrapedClient } from '../clients/scraped.client';
type CanonicalProduct = {
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
        source: 'estimated' | null;
    };
    pricePerUnit: number | null;
    pricePerCalorie: number | null;
};
type ShoppingItem = {
    product: string;
    quantity?: number;
};
type ResearchBasketItem = {
    product: string;
    quantity: number;
    category?: string;
    unit?: string | null;
};
type OptimizeOptions = {
    periodDays?: number;
    targetCalories?: number;
    restrictedStore?: string;
};
type RankedProduct = CanonicalProduct & {
    relevanceScore: number;
    matchScore: number;
};
type CategoryTargetSummary = {
    category: string;
    share: number;
    targetCalories: number;
    plannedCalories: number;
};
type StoreScenarioSummary = {
    storeName: string;
    totalEstimated: number;
    resolvedItems: number;
    requestedItems: number;
    unresolvedItems: string[];
    coverage: number;
    plannedCalories: number;
    targetCalories: number;
};
export declare class ComparisonService {
    private scrapedClient;
    private productClient;
    constructor(scrapedClient: ScrapedClient, productClient: ProductClient);
    compareByProduct(product: string): Promise<{
        product: string;
        canonicalProduct: string[];
        comparedCount: number;
        bestByStore: RankedProduct[];
        ranking: RankedProduct[];
        bestOverall: RankedProduct;
    }>;
    optimizeShoppingList(items?: ShoppingItem[], options?: OptimizeOptions): Promise<{
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
        categoryTargets: CategoryTargetSummary[];
        requestedItems: number;
        resolvedItems: number;
        unresolvedItems: string[];
        totalEstimated: number;
        estimatedByStore: Record<string, number>;
        storeScenarios: StoreScenarioSummary[];
        lines: {
            requested: string;
            category: string;
            quantity: number;
            targetTokens: string[];
            optionsByStore: RankedProduct[];
            selected: RankedProduct | null;
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
            optionsByStore: RankedProduct[];
            selected: RankedProduct;
            caloriesPerPackage: number | null;
            plannedCalories: number | null;
            subtotal: number | null;
        }[];
    }>;
    private optimizeCustomListByCalories;
    getResearchBasket(): Promise<ResearchBasketItem[]>;
    private optimizeBasketByCalories;
    private filterCandidatesByRestrictedStore;
    private buildDraftLine;
    private cloneDraftLine;
    private serializeOptimizeLine;
    private resolveCalorieScenario;
    private buildCategoryTargets;
    private buildStoreScenarioSummaries;
    private collectAvailableStores;
    private getResearchCategoryLookup;
    private inferCategoryForProduct;
    private inferCategoryFromRules;
    private matchesCategoryCue;
    private getCandidateRanking;
    private getTargetMatchTokens;
    private pickBestCalorieValue;
    private pickLowestPriceCandidate;
    private withNutritionTarget;
    private pickCaloriePlanForTarget;
    private toCanonicalProduct;
    private normalizeText;
    private normalizeTextForPresentation;
    private toCanonicalTokens;
    private extractPresentation;
    private toBasePresentationAmount;
    private estimateNutrition;
    private resolveCalorieReferenceKey;
    private caloriesPerBaseUnit;
    private roundNumber;
    private parseLocaleNumber;
    private computeTextMatchScore;
    private withValueScores;
    private isNonGroceryToken;
    private isRelevantForTarget;
    private hasBaseDerivativeNoise;
    private hasFreshProduceDerivativeNoise;
    private getDefaultResearchBasket;
    private storeKey;
    private pickBestByStore;
}
export {};
