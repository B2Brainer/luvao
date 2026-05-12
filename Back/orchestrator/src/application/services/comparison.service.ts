import { Injectable } from '@nestjs/common';
import { ProductClient } from '../clients/product.client';
import { ScrapedClient } from '../clients/scraped.client';

type RawScraped = {
  id: string;
  storeName: string;
  query: string;
  name: string;
  price?: number | null;
  url?: string | null;
  availability?: boolean | null;
  scrapedAt?: string;
};

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
  };
  pricePerUnit: number | null;
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

const STOPWORDS = new Set([
  'de',
  'del',
  'la',
  'el',
  'los',
  'las',
  'con',
  'sin',
  'para',
  'por',
  'en',
  'un',
  'una',
  'x',
  'ml',
  'gr',
  'g',
  'kg',
  'lt',
  'l',
]);

const TOKEN_SYNONYMS: Record<string, string> = {
  arrozs: 'arroz',
  arroces: 'arroz',
  integral: 'integral',
  extra: 'extra',
  aceite: 'aceite',
  aceites: 'aceite',
  vegetal: 'vegetal',
  canola: 'canola',
  girasol: 'girasol',
  atun: 'atún',
  atunes: 'atún',
  pack: 'paq',
  paquete: 'paq',
  paquetes: 'paq',
  libra: 'lb',
  libras: 'lb',
};

const NON_GROCERY_TOKENS = new Set([
  'bioaqua',
  'bloqueador',
  'batidora',
  'bandeja',
  'corporal',
  'jabon',
  'gel',
  'cuchara',
  'dispensador',
  'espumadora',
  'extractor',
  'freidora',
  'hervidor',
  'mango',
  'maleta',
  'maquina',
  'solar',
  'minichefs',
  'morral',
  'organizador',
  'recargable',
  'serun',
  'spray',
  'usb',
  'vaporera',
]);

const NON_GROCERY_STEMS = [
  'organizador',
  'batidor',
  'rejilla',
  'hervidor',
  'hervidora',
  'cocedor',
  'cocedora',
  'cortador',
  'cortadora',
  'pinata',
  'dinosaur',
  'decorativ',
  'casa',
  'vaporera',
  'bandeja',
  'freidora',
  'dispensador',
];

const FOOD_ANCHOR_TOKENS = new Set([
  'arroz',
  'aceite',
  'leche',
  'huevo',
  'huevos',
  'azucar',
  'cafe',
  'atun',
]);

const EGG_QUERY_TOKENS = new Set(['huevo', 'huevos']);

const EGG_FOOD_SIGNALS = new Set([
  'und',
  'unidad',
  'unidades',
  'docena',
  'rojo',
  'blanco',
  'codorniz',
  'organico',
  'avinal',
  'santa',
  'napoles',
  'reyes',
]);

const EGG_NON_FOOD_STEMS = [
  'sarten',
  'molde',
  'soporte',
  'canasta',
  'coccion',
  'cocinar',
  'accesorio',
  'didactic',
  'shaker',
  'hatchimal',
  'kinder',
  'chocolate',
  'rejipla',
  'silicona',
  'cacerola',
  'antiadherente',
  'pancake',
  'gallina',
  'juguete',
];

@Injectable()
export class ComparisonService {
  constructor(
    private scrapedClient: ScrapedClient,
    private productClient: ProductClient,
  ) {}

  async compareByProduct(product: string) {
    const raw = await this.scrapedClient.searchByFilters({
      query: product,
      availability: true,
    });

    const canonicalTarget = this.toCanonicalTokens(product);
    const mapped = raw
      .map((p: RawScraped) => this.toCanonicalProduct(p))
      .map((p) => ({
        ...p,
        matchScore: this.computeMatchScore(canonicalTarget, p.canonicalTokens),
      }))
      .filter((p) => p.matchScore > 0.2)
      .sort((a, b) => {
        const byScore = b.matchScore - a.matchScore;
        if (byScore !== 0) {
          return byScore;
        }
        return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER);
      });

    const bestByStore = this.pickBestByStore(mapped);

    return {
      product,
      canonicalProduct: canonicalTarget,
      comparedCount: mapped.length,
      bestByStore,
      ranking: mapped.slice(0, 30),
      bestOverall: mapped[0] ?? null,
    };
  }

  async optimizeShoppingList(items?: ShoppingItem[]) {
    const requestedItems = items && items.length > 0
      ? items
      : await this.getDefaultResearchBasket();

    const allRaw: RawScraped[] = await this.scrapedClient.searchByFilters({ availability: true });
    const canonicalAll = allRaw.map((p) => this.toCanonicalProduct(p));

    const lines = requestedItems.map((item) => {
      const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const targetTokens = this.toCanonicalTokens(item.product);

      const candidates = canonicalAll
        .map((p) => ({
          ...p,
          matchScore: this.computeMatchScore(targetTokens, p.canonicalTokens),
        }))
        .filter((p) => p.matchScore > 0.2 && p.price !== null)
        .sort((a, b) => {
          const byScore = b.matchScore - a.matchScore;
          if (byScore !== 0) {
            return byScore;
          }
          return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER);
        });

      const bestByStore = this.pickBestByStore(candidates);
      const cheapest = [...bestByStore].sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER))[0] ?? null;

      return {
        requested: item.product,
        quantity,
        targetTokens,
        optionsByStore: bestByStore,
        selected: cheapest,
        subtotal: cheapest?.price ? cheapest.price * quantity : null,
      };
    });

    const selectedLines = lines.filter((l) => l.selected && l.subtotal !== null);
    const total = selectedLines.reduce((acc, l) => acc + (l.subtotal as number), 0);

    const byStore: Record<string, number> = {};
    for (const line of selectedLines) {
      const store = line.selected?.storeName;
      if (!store) {
        continue;
      }
      byStore[store] = (byStore[store] ?? 0) + (line.subtotal as number);
    }

    const unresolved = lines
      .filter((l) => !l.selected)
      .map((l) => l.requested);

    return {
      requestedItems: requestedItems.length,
      resolvedItems: selectedLines.length,
      unresolvedItems: unresolved,
      totalEstimated: total,
      estimatedByStore: byStore,
      lines,
    };
  }

  async getResearchBasket() {
    return await this.getDefaultResearchBasket();
  }

  private toCanonicalProduct(raw: RawScraped): CanonicalProduct {
    const normalizedName = this.normalizeText(raw.name);
    const canonicalTokens = this.toCanonicalTokens(raw.name);
    const presentation = this.extractPresentation(raw.name);
    const availability = raw.availability ?? raw.price !== null;
    const price = raw.price ?? null;

    let pricePerUnit: number | null = null;
    if (price !== null && presentation.amount && presentation.amount > 0 && presentation.unit) {
      const divisor = presentation.unit === 'kg' || presentation.unit === 'l'
        ? presentation.amount
        : presentation.amount / 1000;
      if (divisor > 0) {
        pricePerUnit = Number((price / divisor).toFixed(2));
      }
    }

    return {
      id: raw.id,
      storeName: raw.storeName,
      sourceName: raw.name,
      query: raw.query,
      price,
      availability,
      url: raw.url ?? null,
      scrapedAt: raw.scrapedAt,
      normalizedName,
      canonicalTokens,
      presentation,
      pricePerUnit,
    };
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeTextForPresentation(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.,\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private toCanonicalTokens(value: string): string[] {
    const tokens = this.normalizeText(value)
      .split(' ')
      .map((token) => TOKEN_SYNONYMS[token] ?? token)
      .filter((token) => token.length > 1 && !STOPWORDS.has(token));

    return [...new Set(tokens)].sort();
  }

  private extractPresentation(name: string) {
    const normalized = this.normalizeTextForPresentation(name);
    const match = normalized.match(/(\d+(?:[.,]\d{3})*(?:[.,]\d+)?)\s*(kg|g|gr|l|lt|ml)\b/);
    if (!match) {
      return { amount: null, unit: null, label: null };
    }

    const amount = this.parseLocaleNumber(match[1]);
    const unitRaw = match[2];
    const unit = unitRaw === 'gr'
      ? 'g'
      : unitRaw === 'lt'
      ? 'l'
      : unitRaw;

    return {
      amount: Number.isNaN(amount) ? null : amount,
      unit,
      label: `${match[1]} ${unit}`,
    };
  }

  private parseLocaleNumber(value: string): number {
    const trimmed = value.trim();
    const commas = (trimmed.match(/,/g) || []).length;
    const dots = (trimmed.match(/\./g) || []).length;

    if (dots > 0 && commas > 0) {
      const normalized = trimmed.replace(/\./g, '').replace(',', '.');
      return Number(normalized);
    }

    if (dots > 0 && commas === 0) {
      if (/\.\d{3}(\.|$)/.test(trimmed)) {
        return Number(trimmed.replace(/\./g, ''));
      }
      return Number(trimmed);
    }

    if (commas > 0 && dots === 0) {
      if(/,\d{3}(,|$)/.test(trimmed)) {
        return Number(trimmed.replace(/,/g, ''));
      }
      return Number(trimmed.replace(',', '.'));
    }

    return Number(trimmed);
  }

  private computeMatchScore(targetTokens: string[], candidateTokens: string[]): number {
    if (targetTokens.length === 0 || candidateTokens.length === 0) {
      return 0;
    }

    const targetSet = new Set(targetTokens);
    const candidateSet = new Set(candidateTokens);

    let intersection = 0;
    for (const token of targetSet) {
      if (candidateSet.has(token)) {
        intersection += 1;
      }
    }

    const coverage = intersection / targetSet.size;
    const jaccard = intersection / (targetSet.size + candidateSet.size - intersection);
    const hasNonGrocerySignal = candidateTokens.some((token) => this.isNonGroceryToken(token));
    const hasFoodAnchor = targetTokens.some((token) => FOOD_ANCHOR_TOKENS.has(token));
    const isEggQuery = targetTokens.some((token) => EGG_QUERY_TOKENS.has(token));

    if (isEggQuery) {
      const hasEggFoodSignal = candidateTokens.some((token) => EGG_FOOD_SIGNALS.has(token));
      const hasEggNonFoodSignal = candidateTokens.some((token) =>
        EGG_NON_FOOD_STEMS.some((stem) => token.includes(stem)),
      );

      if (!hasEggFoodSignal || hasEggNonFoodSignal) {
        return 0;
      }
    }

    if (hasFoodAnchor && hasNonGrocerySignal) {
      return 0;
    }

    const penalty = hasNonGrocerySignal ? 0.1 : 1;

    return Number(((coverage * 0.7 + jaccard * 0.3) * penalty).toFixed(4));
  }

  private isNonGroceryToken(token: string): boolean {
    if (NON_GROCERY_TOKENS.has(token)) {
      return true;
    }

    return NON_GROCERY_STEMS.some((stem) => token.includes(stem));
  }

  private async getDefaultResearchBasket(): Promise<ResearchBasketItem[]> {
    try {
      const basket = await this.productClient.getDaneFamilyBasket();
      if (Array.isArray(basket) && basket.length > 0) {
        return basket.map((item: ResearchBasketItem) => ({
          product: item.product,
          quantity: item.quantity > 0 ? item.quantity : 1,
          category: item.category,
          unit: item.unit,
        }));
      }
    } catch {
      // Fallback al catálogo simple si la canasta investigativa no está disponible.
    }

    return (await this.productClient.getProductNames()).map((name: string) => ({
      product: name,
      quantity: 1,
    }));
  }

  private pickBestByStore<T extends { storeName: string; price: number | null; matchScore: number }>(items: T[]): T[] {
    const bestMap = new Map<string, T>();

    for (const item of items) {
      const current = bestMap.get(item.storeName);
      if (!current) {
        bestMap.set(item.storeName, item);
        continue;
      }

      if (item.matchScore > current.matchScore) {
        bestMap.set(item.storeName, item);
        continue;
      }

      if (item.matchScore === current.matchScore) {
        const currentPrice = current.price ?? Number.MAX_SAFE_INTEGER;
        const itemPrice = item.price ?? Number.MAX_SAFE_INTEGER;
        if (itemPrice < currentPrice) {
          bestMap.set(item.storeName, item);
        }
      }
    }

    return [...bestMap.values()].sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
  }
}
