export declare class ShoppingListItemDto {
    product: string;
    quantity?: number;
}
export declare class OptimizeListDto {
    items?: ShoppingListItemDto[];
    periodDays?: number;
    targetCalories?: number;
    restrictedStore?: string;
}
