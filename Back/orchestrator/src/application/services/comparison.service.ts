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
    baseAmount: number | null;
    baseUnit: string | null;
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
  'lb',
  'und',
  'unds',
  'unidad',
  'unidades',
  'y',
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
  fideo: 'pasta',
  fideos: 'pasta',
  espagueti: 'pasta',
  spaghetti: 'pasta',
  macarron: 'pasta',
  macarrones: 'pasta',
  galleta: 'galleta',
  galletas: 'galleta',
  saltin: 'galleta',
  saltinas: 'galleta',
  cracker: 'galleta',
  crackers: 'galleta',
  frijol: 'frijol',
  frijoles: 'frijol',
  lenteja: 'lenteja',
  lentejas: 'lenteja',
  platano: 'platano',
  platanos: 'platano',
  limones: 'limon',
  tomates: 'tomate',
  cebollas: 'cebolla',
  zanahorias: 'zanahoria',
  habichuelas: 'habichuela',
  bananos: 'banano',
  naranjas: 'naranja',
  guayabas: 'guayaba',
  moras: 'mora',
  maracuyas: 'maracuya',
  quesos: 'queso',
  campesinos: 'campesino',
  margarinas: 'margarina',
  mantequillas: 'mantequilla',
  panelas: 'panela',
  huevo: 'huevo',
  huevos: 'huevo',
  atun: 'atún',
  atunes: 'atún',
  pack: 'paq',
  paquete: 'paq',
  paquetes: 'paq',
  libra: 'lb',
  libras: 'lb',
};

const REQUIRED_STORE_KEYS = ['d1', 'exito', 'olimpica'];

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

type ProductRule = {
  all?: string[];
  any?: string[];
  excludeStems?: string[];
};

const PRODUCT_RULES: Record<string, ProductRule> = {
  arroz: { all: ['arroz'], excludeStems: ['galleta', 'achocolat', 'arroz con leche', 'bebida', 'sabor'] },
  pasta: { any: ['pasta'], excludeStems: ['pasta dental', 'pasta de tomate', 'salsa', 'crema'] },
  'harina de trigo': { all: ['harina', 'trigo'] },
  'harina de maiz': { all: ['harina', 'maiz'] },
  pan: { all: ['pan'], excludeStems: ['panela', 'apanado'] },
  'galletas de sal': { any: ['galleta'], excludeStems: ['dulce', 'chocolate', 'wafer', 'rellena', 'crema'] },
  avena: { all: ['avena'], excludeStems: ['bebida', 'galleta', 'barra'] },
  papa: { all: ['papa'], excludeStems: ['frita', 'chips', 'fosforo', 'margarita'] },
  yuca: { all: ['yuca'], excludeStems: ['frita', 'chips'] },
  'platano verde': { all: ['platano'], excludeStems: ['chips', 'maduro', 'tajada'] },
  frijol: { all: ['frijol'], excludeStems: ['salsa', 'enlat'] },
  lentejas: { all: ['lenteja'], excludeStems: ['sopa', 'enlat'] },
  'arveja seca': { all: ['arveja'], excludeStems: ['congelada', 'enlatada', 'sopa'] },
  tomate: { all: ['tomate'], excludeStems: ['tomate de arbol', 'salsa', 'pasta', 'pure', 'ketchup', 'jugo'] },
  'cebolla cabezona': { all: ['cebolla'], excludeStems: ['cebolla larga'] },
  'cebolla larga': { all: ['cebolla', 'larga'] },
  zanahoria: { all: ['zanahoria'], excludeStems: ['bebida', 'jugo', 'galleta', 'dulce'] },
  habichuela: { all: ['habichuela'], excludeStems: ['enlat'] },
  banano: { all: ['banano'], excludeStems: ['bebida', 'jugo', 'galleta', 'dulce'] },
  naranja: { all: ['naranja'], excludeStems: ['bebida', 'jugo', 'galleta', 'dulce'] },
  limon: { all: ['limon'], excludeStems: ['bebida', 'jugo', 'galleta', 'limonada'] },
  guayaba: { all: ['guayaba'], excludeStems: ['bebida', 'jugo', 'galleta', 'dulce'] },
  mora: { all: ['mora'], excludeStems: ['bebida', 'jugo', 'galleta', 'mermelada', 'caramelo'] },
  maracuya: { all: ['maracuya'], excludeStems: ['bebida', 'jugo', 'galleta', 'dulce'] },
  'tomate de arbol': { all: ['tomate', 'arbol'], excludeStems: ['bebida', 'jugo'] },
  'carne de res': { all: ['carne', 'res'], excludeStems: ['perro', 'gato', 'sabor'] },
  'carne de cerdo': { all: ['carne', 'cerdo'], excludeStems: ['perro', 'gato', 'sabor'] },
  pollo: { all: ['pollo'], excludeStems: ['caldo', 'consome', 'sabor', 'sazonador', 'croqueta'] },
  pescado: { any: ['pescado', 'tilapia', 'trucha', 'mojarra', 'filete'], excludeStems: ['atun', 'sardina', 'caldo', 'sabor'] },
  leche: { all: ['leche'], excludeStems: ['crema de leche', 'dulce de leche', 'leche condensada', 'leche de coco', 'chocolate', 'galleta', 'caramelo', 'flan', 'postre'] },
  'queso campesino': { all: ['queso', 'campesino'], excludeStems: ['sabor', 'snack'] },
  'aceite vegetal': { all: ['aceite'], excludeStems: ['atun', 'motor', 'motocicleta', 'automotr', 'lubric', 'masaje', 'esencial'] },
  aceite: { all: ['aceite'], excludeStems: ['atun', 'motor', 'motocicleta', 'automotr', 'lubric', 'masaje', 'esencial'] },
  margarina: { all: ['margarina'] },
  mantequilla: { all: ['mantequilla'], excludeStems: ['mani', 'cacahuate', 'cacao'] },
  azucar: { all: ['azucar'], excludeStems: ['sin azucar', '0 azucar', 'mango', 'bebida', 'galleta', 'caramelo', 'endulzado'] },
  panela: { all: ['panela'], excludeStems: ['bebida', 'galleta', 'dulce'] },
  sal: { all: ['sal'], excludeStems: ['salsa', 'salchicha'] },
  cafe: { all: ['cafe'], excludeStems: ['galleta', 'cafecitas', 'dulce', 'chocolate', 'sabor cafe', 'licor'] },
};

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
    const relevant: Array<CanonicalProduct & { relevanceScore: number }> = raw
      .map((p: RawScraped) => this.toCanonicalProduct(p))
      .map((p) => ({
        ...p,
        relevanceScore: this.computeTextMatchScore(canonicalTarget, p.canonicalTokens),
      }))
      .filter((p) => p.price !== null && p.relevanceScore > 0.2 && this.isRelevantForTarget(product, p));

    const completeRelevant: Array<CanonicalProduct & { relevanceScore: number }> = this.keepOnlyCompleteStoreSet(relevant);
    const mapped = this.withValueScores(completeRelevant)
      .sort((a, b) => {
        const byScore = b.matchScore - a.matchScore;
        if (byScore !== 0) {
          return byScore;
        }
        return (a.pricePerUnit ?? Number.MAX_SAFE_INTEGER) - (b.pricePerUnit ?? Number.MAX_SAFE_INTEGER);
      });

    const bestByStore = this.pickBestByStore(mapped);
    const missingStores = this.getMissingRequiredStores(relevant);

    return {
      product,
      canonicalProduct: canonicalTarget,
      comparedCount: mapped.length,
      missingStores,
      bestByStore,
      ranking: mapped,
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

      const relevant: Array<CanonicalProduct & { relevanceScore: number }> = canonicalAll
        .map((p) => ({
          ...p,
          relevanceScore: this.computeTextMatchScore(targetTokens, p.canonicalTokens),
        }))
        .filter((p) => p.relevanceScore > 0.2 && p.price !== null && this.isRelevantForTarget(item.product, p));

      const completeRelevant: Array<CanonicalProduct & { relevanceScore: number }> = this.keepOnlyCompleteStoreSet(relevant);
      const candidates = this.withValueScores(completeRelevant)
        .sort((a, b) => {
          const byScore = b.matchScore - a.matchScore;
          if (byScore !== 0) {
            return byScore;
          }
          return (a.pricePerUnit ?? Number.MAX_SAFE_INTEGER) - (b.pricePerUnit ?? Number.MAX_SAFE_INTEGER);
        });

      const bestByStore = this.pickBestByStore(candidates);
      const bestValue = bestByStore[0] ?? null;

      return {
        requested: item.product,
        quantity,
        targetTokens,
        optionsByStore: bestByStore,
        missingStores: this.getMissingRequiredStores(relevant),
        selected: bestValue,
        subtotal: bestValue?.price ? bestValue.price * quantity : null,
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
    if (price !== null && presentation.baseAmount && presentation.baseAmount > 0) {
      pricePerUnit = Number((price / presentation.baseAmount).toFixed(2));
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
    const measureMatch = normalized.match(/(\d+(?:[.,]\d{3})*(?:[.,]\d+)?)\s*(kg|kilo|kilos|g|gr|grs|gramo|gramos|l|lt|litro|litros|ml|cc|lb|libra|libras)\b/);
    const countMatch = normalized.match(/(\d+(?:[.,]\d{3})*(?:[.,]\d+)?)\s*(und|unds|unidad|unidades|u)\b/);
    const match = measureMatch ?? countMatch;
    if (!match) {
      const packMatch = normalized.match(/\bx\s*(\d+(?:[.,]\d+)?)\b/);
      if (packMatch) {
        const amount = this.parseLocaleNumber(packMatch[1]);
        return {
          amount: Number.isNaN(amount) ? null : amount,
          unit: 'und',
          label: `x ${packMatch[1]} und`,
          baseAmount: Number.isNaN(amount) ? null : amount,
          baseUnit: 'und',
        };
      }

      if (/\bdocena\b/.test(normalized)) {
        return {
          amount: 12,
          unit: 'und',
          label: 'docena',
          baseAmount: 12,
          baseUnit: 'und',
        };
      }

      return { amount: null, unit: null, label: null, baseAmount: null, baseUnit: null };
    }

    const amount = this.parseLocaleNumber(match[1]);
    const unitRaw = match[2];
    const unit = ['gr', 'grs', 'gramo', 'gramos'].includes(unitRaw)
      ? 'g'
      : ['lt', 'litro', 'litros'].includes(unitRaw)
      ? 'l'
      : ['kilo', 'kilos'].includes(unitRaw)
      ? 'kg'
      : ['libra', 'libras'].includes(unitRaw)
      ? 'lb'
      : ['unds', 'unidad', 'unidades', 'u'].includes(unitRaw)
      ? 'und'
      : unitRaw;
    const base = this.toBasePresentationAmount(amount, unit);

    return {
      amount: Number.isNaN(amount) ? null : amount,
      unit,
      label: `${match[1]} ${unit}`,
      baseAmount: base.amount,
      baseUnit: base.unit,
    };
  }

  private toBasePresentationAmount(amount: number, unit: string): { amount: number | null; unit: string | null } {
    if (Number.isNaN(amount) || amount <= 0) {
      return { amount: null, unit: null };
    }

    if (unit === 'kg') {
      return { amount, unit: 'kg' };
    }
    if (unit === 'g') {
      return { amount: amount / 1000, unit: 'kg' };
    }
    if (unit === 'lb') {
      return { amount: amount * 0.5, unit: 'kg' };
    }
    if (unit === 'l') {
      return { amount, unit: 'l' };
    }
    if (unit === 'ml' || unit === 'cc') {
      return { amount: amount / 1000, unit: 'l' };
    }
    if (unit === 'und') {
      return { amount, unit: 'und' };
    }

    return { amount: null, unit: null };
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

  private computeTextMatchScore(targetTokens: string[], candidateTokens: string[]): number {
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

  private withValueScores<T extends CanonicalProduct & { relevanceScore: number }>(items: T[]): Array<T & { matchScore: number }> {
    const unitPrices = items
      .map((item) => item.pricePerUnit)
      .filter((value): value is number => value !== null && value > 0);
    const rawPrices = items
      .map((item) => item.price)
      .filter((value): value is number => value !== null && value > 0);

    const bestUnitPrice = unitPrices.length ? Math.min(...unitPrices) : null;
    const bestRawPrice = rawPrices.length ? Math.min(...rawPrices) : null;

    return items.map((item) => {
      let score = 0;

      if (bestUnitPrice !== null && item.pricePerUnit && item.pricePerUnit > 0) {
        score = bestUnitPrice / item.pricePerUnit;
      } else if (bestUnitPrice === null && bestRawPrice !== null && item.price && item.price > 0) {
        score = bestRawPrice / item.price;
      }

      return {
        ...item,
        matchScore: Number(Math.max(0, Math.min(score, 1)).toFixed(4)),
      };
    });
  }

  private isNonGroceryToken(token: string): boolean {
    if (NON_GROCERY_TOKENS.has(token)) {
      return true;
    }

    return NON_GROCERY_STEMS.some((stem) => token.includes(stem));
  }

  private isRelevantForTarget(target: string, candidate: CanonicalProduct): boolean {
    const targetNorm = this.normalizeText(target);
    const tokens = new Set(candidate.canonicalTokens);
    const name = candidate.normalizedName;
    const rule = PRODUCT_RULES[targetNorm];

    if (!rule) {
      return true;
    }

    if (rule.all?.some((token) => !tokens.has(token))) {
      return false;
    }

    if (rule.any && !rule.any.some((token) => tokens.has(token) || name.includes(token))) {
      return false;
    }

    if (rule.excludeStems?.some((stem) => name.includes(stem))) {
      return false;
    }

    if (targetNorm === 'cebolla cabezona' && tokens.has('larga')) {
      return false;
    }

    if (targetNorm === 'platano verde' && tokens.has('maduro')) {
      return false;
    }

    if (targetNorm === 'leche') {
      const allowed = [
        'leche entera',
        'leche semidescremada',
        'leche descremada',
        'leche deslactosada',
        'leche uht',
        'leche larga vida',
        'leche en polvo',
        'leche evaporada',
      ];
      return allowed.some((stem) => name.includes(stem)) || tokens.has('leche');
    }

    return true;
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

  private keepOnlyCompleteStoreSet<T extends { storeName: string }>(items: T[]): T[] {
    const missingStores = this.getMissingRequiredStores(items);
    return missingStores.length === 0 ? items : [];
  }

  private getMissingRequiredStores<T extends { storeName: string }>(items: T[]): string[] {
    const present = new Set(items.map((item) => this.storeKey(item.storeName)));
    return REQUIRED_STORE_KEYS.filter((store) => !present.has(store));
  }

  private storeKey(storeName: string): string {
    const normalized = this.normalizeText(storeName);
    if (normalized.includes('d1')) {
      return 'd1';
    }
    if (normalized.includes('exito')) {
      return 'exito';
    }
    if (normalized.includes('olimpica')) {
      return 'olimpica';
    }
    return normalized;
  }

  private pickBestByStore<T extends { storeName: string; price: number | null; pricePerUnit?: number | null; matchScore: number }>(items: T[]): T[] {
    const bestMap = new Map<string, T>();

    for (const item of items) {
      const store = this.storeKey(item.storeName);
      const current = bestMap.get(store);
      if (!current) {
        bestMap.set(store, item);
        continue;
      }

      if (item.matchScore > current.matchScore) {
        bestMap.set(store, item);
        continue;
      }

      if (item.matchScore === current.matchScore) {
        const currentPrice = current.pricePerUnit ?? current.price ?? Number.MAX_SAFE_INTEGER;
        const itemPrice = item.pricePerUnit ?? item.price ?? Number.MAX_SAFE_INTEGER;
        if (itemPrice < currentPrice) {
          bestMap.set(store, item);
        }
      }
    }

    return [...bestMap.values()].sort((a, b) => {
      const byScore = b.matchScore - a.matchScore;
      if (byScore !== 0) {
        return byScore;
      }
      return (a.pricePerUnit ?? a.price ?? Number.MAX_SAFE_INTEGER) - (b.pricePerUnit ?? b.price ?? Number.MAX_SAFE_INTEGER);
    });
  }
}
