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
};

type BaseUnit = 'kg' | 'l' | 'und';

type CalorieReference = {
  caloriesPerKg?: number;
  caloriesPerL?: number;
  caloriesPerUnit?: number;
  caloriesPerKgDense?: number;
};

type RankedProduct = CanonicalProduct & {
  relevanceScore: number;
  matchScore: number;
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
  manzanas: 'manzana',
  peras: 'pera',
  papayas: 'papaya',
  mangos: 'mango',
  pinas: 'pina',
  fresas: 'fresa',
  uvas: 'uva',
  mandarinas: 'mandarina',
  ajos: 'ajo',
  cilantros: 'cilantro',
  pepinos: 'pepino',
  lechugas: 'lechuga',
  quesos: 'queso',
  campesinos: 'campesino',
  margarinas: 'margarina',
  mantequillas: 'mantequilla',
  panelas: 'panela',
  huevo: 'huevo',
  huevos: 'huevo',
  atun: 'atun',
  atunes: 'atun',
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
  'jab',
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
  excludeTokens?: string[];
};

const BASE_PRODUCT_DERIVATIVE_STEMS = [
  'sabor',
  'mezcla',
  'relleno',
  'rellena',
  'con queso',
  'con mantequilla',
  'brownie',
  'snack',
  'bebida',
  'refresc',
];

const FRESH_PRODUCE_TARGETS = new Set([
  'papa',
  'yuca',
  'platano verde',
  'tomate',
  'cebolla cabezona',
  'cebolla larga',
  'zanahoria',
  'habichuela',
  'banano',
  'naranja',
  'limon',
  'guayaba',
  'mora',
  'maracuya',
  'tomate de arbol',
  'manzana',
  'pera',
  'papaya',
  'mango',
  'pina',
  'fresa',
  'uva',
  'mandarina',
  'ajo',
  'cilantro',
  'pepino',
  'lechuga',
]);

const FRESH_PRODUCE_DERIVATIVE_STEMS = [
  'gelatina',
  'natilla',
  'flan',
  'mousse',
  'postre',
  'dulce',
  'mermelada',
  'jalea',
  'compota',
  'conserva',
  'almibar',
  'pulpa',
  'concentr',
  'nectar',
  'jarabe',
  'sirope',
  'bebida',
  'batido',
  'jugo',
  'refresc',
  'gaseosa',
  'sabor',
  'tea',
  'infusion',
  'aromatica',
  'yogur',
  'yogurt',
  'yoghurt',
  'yogo',
  'helado',
  'galleta',
  'cereal',
  'granola',
  'barra',
  'caramelo',
  'gomita',
  'snack',
  'chips',
  'pastel',
  'pastelito',
  'ponque',
  'torta',
];

const COMMON_FRUIT_DERIVATIVE_STEMS = [
  ...FRESH_PRODUCE_DERIVATIVE_STEMS,
  'protector',
  'jabon',
  'shampoo',
  'acondicionador',
  'mascarilla',
  'exfoliante',
];

const COMMON_HERB_DERIVATIVE_STEMS = [
  'salsa',
  'aderezo',
  'pasta',
  'polvo',
  'sazonador',
  'semilla',
  'encurtido',
];

const PRODUCT_RULES: Record<string, ProductRule> = {
  arroz: { all: ['arroz'], excludeStems: ['galleta', 'achocolat', 'arroz con leche', 'bebida', 'sabor'] },
  pasta: { any: ['pasta'], excludeStems: ['pasta dental', 'pasta de tomate', 'salsa', 'crema'] },
  'harina de trigo': { all: ['harina', 'trigo'] },
  'harina de maiz': { all: ['harina', 'maiz'] },
  pan: { all: ['pan'], excludeStems: ['panela', 'apanado', 'harina', 'pasta', 'spaghetti', 'espagueti', 'macarron', 'mezcla', 'arepa', 'miga de pan'] },
  'galletas de sal': { any: ['galleta'], excludeStems: ['dulce', 'chocolate', 'wafer', 'rellena', 'relleno', 'crema', 'mix', 'queso', 'mantequilla'] },
  avena: { all: ['avena'], excludeStems: ['bebida', 'galleta', 'barra'] },
  papa: { all: ['papa'], excludeStems: ['frita', 'chips', 'fosforo', 'margarita'] },
  yuca: { all: ['yuca'], excludeStems: ['frita', 'chips'] },
  'platano verde': { all: ['platano'], excludeStems: ['chips', 'maduro', 'tajada'] },
  frijol: { all: ['frijol'], excludeStems: ['salsa', 'enlat'] },
  lentejas: { all: ['lenteja'], excludeStems: ['sopa', 'enlat'] },
  'arveja seca': { all: ['arveja'], excludeStems: ['congelada', 'enlatada', 'sopa'] },
  tomate: { all: ['tomate'], excludeStems: ['tomate de arbol', 'salsa', 'pasta', 'pure', 'ketchup', 'jugo'] },
  'cebolla cabezona': { all: ['cebolla'], excludeStems: ['cebolla larga'] },
  'cebolla larga': { all: ['cebolla', 'larga'], excludeStems: ['pasta', 'salsa', 'polvo', 'sazonador'] },
  zanahoria: { all: ['zanahoria'], excludeStems: ['arveja', 'bebida', 'jugo', 'galleta', 'dulce', 'sabor'] },
  habichuela: { all: ['habichuela'], excludeStems: ['enlat'] },
  banano: { all: ['banano'], excludeTokens: ['te'], excludeStems: ['bebida', 'jugo', 'galleta', 'dulce', 'sabor', 'tea', 'infusion', 'aromatica', 'avena', 'cereal', 'granola', 'yogur', 'helado'] },
  naranja: { all: ['naranja'], excludeTokens: ['te'], excludeStems: ['bebida', 'jugo', 'galleta', 'dulce', 'sabor', 'tea', 'infusion', 'aromatica', 'avena', 'cereal', 'granola', 'yogur', 'helado'] },
  limon: { all: ['limon'], excludeTokens: ['te'], excludeStems: ['panela', 'boka', 'refresc', 'bebida', 'jugo', 'galleta', 'limonada', 'agua', 'omi', 'ditopax', 'tableta', 'tablet', 'pastilla', 'blister', 'sal de frutas', 'alivio', 'lua', 'sobre', 'sobres', 'blanqueador', 'ultralimp', 'limpiador', 'platanito', 'platanitos', 'choclito', 'choclitos', 'papas', 'sexta', 'gaseosa', 'sprite', 'lima limon', 'zero', 'chip', 'chips', 'snack', 'sabor', 'tea', 'infusion', 'aromatica', 'avena', 'cereal', 'granola', 'yogur', 'helado'] },
  guayaba: { all: ['guayaba'], excludeTokens: ['te'], excludeStems: ['protector', 'bolsa protector', 'manzana', 'queso', 'pastel', 'pastelito', 'pan ', 'bebida', 'jugo', 'galleta', 'dulce', 'sabor', 'tea', 'infusion', 'aromatica', 'avena', 'cereal', 'granola', 'yogur', 'helado'] },
  mora: { all: ['mora'], excludeTokens: ['te'], excludeStems: ['bebida', 'jugo', 'refresc', 'fresky', 'hit', 'galleta', 'mermelada', 'caramelo', 'sabor', 'tea', 'infusion', 'aromatica', 'avena', 'cereal', 'granola', 'yogur', 'yogurt', 'yoghurt', 'yagur', 'yogo', 'helado', 'activox', 'jengibre', 'sobre', 'uva', 'fresa', 'arandano', 'plato', 'ceramica', 'microondas', 'lavavajillas', 'juego', 'jab ', 'jabon', 'suppra', 'care'] },
  maracuya: { all: ['maracuya'], excludeTokens: ['te'], excludeStems: ['agua', 'agua con gas', 'gas', 'omi', 'panela', 'refresc', 'bebida', 'beb hidrat', 'hidrat', 'hidralyte', 'suero', 'electrolit', 'jugo', 'galleta', 'dulce', 'sabor', 'tea', 'infusion', 'aromatica', 'yerbabuena', 'sobre', 'sobres', 'o1ne', 'night', 'nigth', 'caja', 'avena', 'cereal', 'granola', 'yogur', 'helado'] },
  'tomate de arbol': { all: ['tomate', 'arbol'], excludeTokens: ['te'], excludeStems: ['bebida', 'jugo', 'sabor', 'tea', 'infusion', 'aromatica'] },
  manzana: { all: ['manzana'], excludeTokens: ['te'], excludeStems: COMMON_FRUIT_DERIVATIVE_STEMS },
  pera: { all: ['pera'], excludeTokens: ['te'], excludeStems: COMMON_FRUIT_DERIVATIVE_STEMS },
  papaya: { all: ['papaya'], excludeTokens: ['te'], excludeStems: COMMON_FRUIT_DERIVATIVE_STEMS },
  mango: { all: ['mango'], excludeTokens: ['te'], excludeStems: [...COMMON_FRUIT_DERIVATIVE_STEMS, 'escoba', 'trapero', 'madera', 'cuchillo', 'sarten', 'cepillo', 'herramienta'] },
  pina: { all: ['pina'], excludeTokens: ['te'], excludeStems: COMMON_FRUIT_DERIVATIVE_STEMS },
  ajo: { all: ['ajo'], excludeStems: ['sal de ajo', 'pan de ajo', 'adobo', 'sazonador', 'salsa', 'pasta', 'polvo'] },
  cilantro: { all: ['cilantro'], excludeStems: COMMON_HERB_DERIVATIVE_STEMS },
  pepino: { all: ['pepino'], excludeStems: [...COMMON_HERB_DERIVATIVE_STEMS, 'jabon', 'shampoo', 'gel de', 'mascarilla', 'exfoliante'] },
  lechuga: { all: ['lechuga'], excludeStems: ['semilla', 'jabon', 'gel de'] },
  'carne de res': { all: ['carne', 'res'], excludeStems: ['perro', 'gato', 'sabor'] },
  'carne de cerdo': { all: ['carne', 'cerdo'], excludeStems: ['perro', 'gato', 'sabor'] },
  pollo: { all: ['pollo'], excludeStems: ['pastel', 'pastelito', 'caldo', 'consome', 'sabor', 'sazonador', 'croqueta', 'pata de pollo', 'patas de pollo', 'salchichon', 'salchicha', 'embutido', 'jamon', 'mortadela', 'nugget', 'apanado', 'hamburguesa', 'marinad'] },
  pescado: { any: ['pescado', 'tilapia', 'trucha', 'mojarra', 'filete'], excludeStems: ['salsa', 'tomate', 'gatsy', 'purina', 'alimento para gato', 'gato', 'perro', 'cabeza', 'atun', 'sardina', 'caldo', 'sabor'] },
  atun: { all: ['atun'], excludeStems: ['gatsy', 'purina', 'gato', 'perro', 'alimento para gato', 'alimento para perro'] },
  leche: { all: ['leche'], excludeStems: ['crema de leche', 'dulce de leche', 'leche condensada', 'leche de coco', 'chocolate', 'galleta', 'caramelo', 'flan', 'postre', 'avena', 'pan ', 'cereal', 'yogur', 'yogurt', 'yogo'] },
  'queso campesino': { all: ['queso', 'campesino'], excludeStems: ['arepa', 'sabor', 'snack'] },
  'aceite vegetal': { all: ['aceite'], excludeStems: ['atun', 'motor', 'motocicleta', 'automotr', 'lubric', 'masaje', 'esencial'] },
  aceite: { all: ['aceite'], excludeStems: ['atun', 'motor', 'motocicleta', 'automotr', 'lubric', 'masaje', 'esencial'] },
  margarina: { all: ['margarina'] },
  mantequilla: { all: ['mantequilla'], excludeStems: ['caladito', 'caladitos', 'panecillo', 'pancito', 'pancitos', 'comapan', 'arepa', 'tortilla', 'tortillas', 'lechuga', 'organica', 'palomitas', 'crispetas', 'popetas', 'popflix', 'caramelo', 'maiz', 'tostada', 'tostadas', 'delipop', 'galleta', 'saltin', 'queso', 'papel mantequilla', 'papel', 'block', 'icopel', 'recipiente', 'plastico', 'plastic', 'contenedor', 'envase', 'locknlock', 'mani', 'cacahuate', 'cacao'] },
  azucar: { all: ['azucar'], excludeStems: ['sin azucar', '0 azucar', 'cero azucar', 'mango', 'brownie', 'torta', 'refresc', 'bebida', 'galleta', 'caramelo', 'endulzado'] },
  panela: { all: ['panela'], excludeStems: ['bebida', 'galleta', 'dulce'] },
  sal: { all: ['sal'], excludeStems: ['sal de frutas', 'fruta', 'alivio', 'lua', 'limon', 'arepa', 'maiz', 'antioquena', 'con sal', 'mantequilla', 'salsa', 'salchicha'] },
  cafe: { all: ['cafe'], excludeStems: ['crema cafe', 'crema', 'cafe frio', 'frio', 'botella', 'cafe con leche', 'con leche', 'latte', 'capuccino', 'cappuccino', 'bebida', 'galleta', 'cafecitas', 'dulce', 'chocolate', 'sabor cafe', 'licor'] },
};

const DEFAULT_PERIOD_DAYS = 30;
const DEFAULT_DAILY_CALORIES = 2200;

const CATEGORY_CALORIE_SHARE: Record<string, number> = {
  'Cereales y harinas': 0.28,
  'Tubérculos y plátanos': 0.1,
  Legumbres: 0.06,
  'Verduras y hortalizas': 0.14,
  Frutas: 0.12,
  Proteínas: 0.17,
  Lácteos: 0.06,
  'Grasas y complementos': 0.04,
  'Endulzantes y básicos': 0.02,
  'Bebidas y otros': 0.01,
};

const CALORIE_REFERENCES: Record<string, CalorieReference> = {
  arroz: { caloriesPerKg: 1100 },
  pasta: { caloriesPerKg: 1550 },
  'harina de trigo': { caloriesPerKg: 2100 },
  'harina de maiz': { caloriesPerKg: 2200 },
  pan: { caloriesPerKg: 2670 },
  'galletas de sal': { caloriesPerKg: 4500 },
  avena: { caloriesPerKg: 1700 },
  papa: { caloriesPerKg: 770 },
  yuca: { caloriesPerKg: 1600 },
  'platano verde': { caloriesPerKg: 1220, caloriesPerUnit: 218 },
  frijol: { caloriesPerKg: 1270 },
  lentejas: { caloriesPerKg: 1160 },
  'arveja seca': { caloriesPerKg: 1180 },
  tomate: { caloriesPerKg: 180 },
  'cebolla cabezona': { caloriesPerKg: 400 },
  'cebolla larga': { caloriesPerKg: 320 },
  zanahoria: { caloriesPerKg: 410 },
  habichuela: { caloriesPerKg: 310 },
  banano: { caloriesPerKg: 890, caloriesPerUnit: 89 },
  naranja: { caloriesPerKg: 470, caloriesPerUnit: 62 },
  limon: { caloriesPerKg: 290, caloriesPerUnit: 17 },
  guayaba: { caloriesPerKg: 680, caloriesPerUnit: 68 },
  mora: { caloriesPerKg: 430 },
  maracuya: { caloriesPerKg: 970, caloriesPerUnit: 17 },
  'tomate de arbol': { caloriesPerKg: 480, caloriesPerUnit: 40 },
  'carne de res': { caloriesPerKg: 2170 },
  'carne de cerdo': { caloriesPerKg: 2210 },
  pollo: { caloriesPerKg: 1650 },
  pescado: { caloriesPerKg: 1280 },
  huevos: { caloriesPerKg: 1550, caloriesPerUnit: 70 },
  huevo: { caloriesPerKg: 1550, caloriesPerUnit: 70 },
  leche: { caloriesPerKg: 610, caloriesPerL: 610, caloriesPerKgDense: 4960 },
  'queso campesino': { caloriesPerKg: 2600 },
  'aceite vegetal': { caloriesPerKg: 8840, caloriesPerL: 8133 },
  aceite: { caloriesPerKg: 8840, caloriesPerL: 8133 },
  margarina: { caloriesPerKg: 7200 },
  mantequilla: { caloriesPerKg: 7170 },
  azucar: { caloriesPerKg: 3870 },
  panela: { caloriesPerKg: 3500 },
  sal: { caloriesPerKg: 0 },
  cafe: { caloriesPerKg: 0 },
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
    const canonicalRaw = raw.map((p: RawScraped) => this.toCanonicalProduct(p, product));
    const mapped = this.getCandidateRanking(product, canonicalRaw);

    const bestByStore = this.pickBestByStore(mapped);

    return {
      product,
      canonicalProduct: canonicalTarget,
      comparedCount: mapped.length,
      bestByStore,
      ranking: mapped,
      bestOverall: mapped[0] ?? null,
    };
  }

  async optimizeShoppingList(items?: ShoppingItem[], options: OptimizeOptions = {}) {
    const isManualList = Boolean(items && items.length > 0);
    const hasScenarioOptions = Boolean(
      (options.periodDays && options.periodDays > 0) ||
      (options.targetCalories && options.targetCalories > 0),
    );
    const requestedItems = isManualList ? items as ShoppingItem[] : await this.getDefaultResearchBasket();

    const allRaw: RawScraped[] = await this.scrapedClient.searchByFilters({ availability: true });
    const canonicalAll = allRaw.map((p) => this.toCanonicalProduct(p));

    if (!isManualList) {
      return this.optimizeBasketByCalories(requestedItems as ResearchBasketItem[], canonicalAll, options);
    }

    if (hasScenarioOptions) {
      return this.optimizeCustomListByCalories(requestedItems as ShoppingItem[], canonicalAll, options);
    }

    const lines = requestedItems.map((item) => {
      const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const targetTokens = this.toCanonicalTokens(item.product);
      const candidates = this.getCandidateRanking(item.product, canonicalAll);
      const bestByStore = this.pickBestByStore(candidates);
      const bestValue = bestByStore[0] ?? null;

      return {
        requested: item.product,
        quantity,
        targetTokens,
        optionsByStore: bestByStore,
        selected: bestValue,
        caloriesPerPackage: bestValue?.nutrition.calories ?? null,
        plannedCalories: bestValue?.nutrition.calories
          ? this.roundNumber(bestValue.nutrition.calories * quantity, 0)
          : null,
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
      mode: 'manual',
      requestedItems: requestedItems.length,
      resolvedItems: selectedLines.length,
      unresolvedItems: unresolved,
      totalEstimated: total,
      estimatedByStore: byStore,
      lines,
    };
  }

  private optimizeCustomListByCalories(
    requestedItems: ShoppingItem[],
    canonicalAll: CanonicalProduct[],
    options: OptimizeOptions,
  ) {
    const periodDays = options.periodDays && options.periodDays > 0
      ? Math.round(options.periodDays)
      : DEFAULT_PERIOD_DAYS;
    const targetCalories = options.targetCalories && options.targetCalories > 0
      ? Math.round(options.targetCalories)
      : Math.round(DEFAULT_DAILY_CALORIES * periodDays);

    const drafts = requestedItems.map((item) => {
      const requestedQuantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const candidates = this.getCandidateRanking(item.product, canonicalAll);
      const bestByStore = this.pickBestByStore(candidates);

      return {
        requested: item.product,
        category: 'Lista personalizada',
        requestedQuantity,
        quantity: requestedQuantity,
        targetTokens: this.toCanonicalTokens(item.product),
        optionsByStore: bestByStore,
        candidates,
        selected: null as RankedProduct | null,
        caloriesPerPackage: null as number | null,
        targetCalories: null as number | null,
        plannedCalories: null as number | null,
        subtotal: null as number | null,
      };
    });

    const caloricLines = drafts.filter((line) =>
      line.candidates.some((candidate) => candidate.nutrition.calories !== null && candidate.nutrition.calories > 0),
    );
    const totalWeight = caloricLines.reduce((acc, line) => acc + line.requestedQuantity, 0);

    for (const line of drafts) {
      const targetPerProduct = totalWeight > 0 && caloricLines.includes(line)
        ? (targetCalories * line.requestedQuantity) / totalWeight
        : null;
      const caloriePlan = targetPerProduct !== null
        ? this.pickCaloriePlanForTarget(line.candidates, targetPerProduct)
        : null;
      const selected = caloriePlan?.selected ??
        this.pickBestCalorieValue(line.candidates) ??
        this.pickLowestPriceCandidate(line.candidates) ??
        line.optionsByStore[0] ??
        null;

      line.selected = selected;

      if (!line.selected) {
        line.quantity = 0;
        continue;
      }

      line.caloriesPerPackage = line.selected.nutrition.calories;

      if (caloriePlan && targetPerProduct !== null) {
        line.targetCalories = this.roundNumber(targetPerProduct, 0);
        line.quantity = caloriePlan.quantity;
        line.plannedCalories = caloriePlan.plannedCalories;
      } else if (line.caloriesPerPackage && line.caloriesPerPackage > 0) {
        line.plannedCalories = this.roundNumber(line.quantity * line.caloriesPerPackage, 0);
      }

      line.subtotal = line.selected.price ? line.selected.price * line.quantity : null;
    }

    const selectedLines = drafts.filter((line) => line.selected && line.subtotal !== null);
    const total = selectedLines.reduce((acc, line) => acc + (line.subtotal as number), 0);
    const plannedCalories = selectedLines.reduce((acc, line) => acc + (line.plannedCalories ?? 0), 0);

    const byStore: Record<string, number> = {};
    for (const line of selectedLines) {
      const store = line.selected?.storeName;
      if (!store) {
        continue;
      }
      byStore[store] = (byStore[store] ?? 0) + (line.subtotal as number);
    }

    const unresolved = drafts
      .filter((line) => !line.selected)
      .map((line) => line.requested);

    return {
      mode: 'calorie-plan',
      periodDays,
      targetCalories,
      targetRangeCalories: {
        min: this.roundNumber((48000 / DEFAULT_PERIOD_DAYS) * periodDays, 0),
        max: this.roundNumber((90000 / DEFAULT_PERIOD_DAYS) * periodDays, 0),
      },
      plannedCalories: this.roundNumber(plannedCalories, 0),
      categoryTargets: [
        {
          category: 'Lista personalizada',
          share: 1,
          targetCalories,
          plannedCalories: this.roundNumber(plannedCalories, 0),
        },
      ],
      requestedItems: requestedItems.length,
      resolvedItems: selectedLines.length,
      unresolvedItems: unresolved,
      totalEstimated: total,
      estimatedByStore: byStore,
      lines: drafts.map(({ candidates, requestedQuantity, ...line }) => line),
    };
  }

  async getResearchBasket() {
    return await this.getDefaultResearchBasket();
  }

  private optimizeBasketByCalories(
    requestedItems: ResearchBasketItem[],
    canonicalAll: CanonicalProduct[],
    options: OptimizeOptions,
  ) {
    const periodDays = options.periodDays && options.periodDays > 0
      ? Math.round(options.periodDays)
      : DEFAULT_PERIOD_DAYS;
    const targetCalories = options.targetCalories && options.targetCalories > 0
      ? Math.round(options.targetCalories)
      : Math.round(DEFAULT_DAILY_CALORIES * periodDays);

    const drafts = requestedItems.map((item) => {
      const targetTokens = this.toCanonicalTokens(item.product);
      const candidates = this.getCandidateRanking(item.product, canonicalAll);
      const bestByStore = this.pickBestByStore(candidates);

      return {
        requested: item.product,
        category: item.category ?? 'Sin categoría',
        quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
        targetTokens,
        optionsByStore: bestByStore,
        candidates,
        selected: null as RankedProduct | null,
        caloriesPerPackage: null as number | null,
        targetCalories: null as number | null,
        plannedCalories: null as number | null,
        subtotal: null as number | null,
      };
    });

    const categoryGroups = new Map<string, typeof drafts>();
    for (const draft of drafts) {
      const current = categoryGroups.get(draft.category) ?? [];
      current.push(draft);
      categoryGroups.set(draft.category, current);
    }

    for (const [category, categoryLines] of categoryGroups.entries()) {
      const share = CATEGORY_CALORIE_SHARE[category] ?? null;
      const categoryTarget = share !== null ? targetCalories * share : null;
      const caloricLines = categoryLines.filter((line) =>
        line.candidates.some((candidate) => candidate.nutrition.calories !== null && candidate.nutrition.calories > 0),
      );
      const targetPerProduct = categoryTarget !== null && caloricLines.length > 0
        ? categoryTarget / caloricLines.length
        : null;

      for (const line of categoryLines) {
        const caloriePlan = targetPerProduct !== null
          ? this.pickCaloriePlanForTarget(line.candidates, targetPerProduct)
          : null;
        const selected = caloriePlan?.selected ??
          this.pickBestCalorieValue(line.candidates) ??
          this.pickLowestPriceCandidate(line.candidates) ??
          line.optionsByStore[0] ??
          null;
        line.selected = selected;

        if (!line.selected) {
          line.quantity = 0;
          continue;
        }

        line.caloriesPerPackage = line.selected.nutrition.calories;

        if (caloriePlan && targetPerProduct !== null) {
          line.targetCalories = this.roundNumber(targetPerProduct, 0);
          line.quantity = caloriePlan.quantity;
          line.plannedCalories = caloriePlan.plannedCalories;
        } else if (line.caloriesPerPackage && line.caloriesPerPackage > 0) {
          line.plannedCalories = this.roundNumber(line.quantity * line.caloriesPerPackage, 0);
        }

        line.subtotal = line.selected.price ? line.selected.price * line.quantity : null;
      }
    }

    const selectedLines = drafts.filter((line) => line.selected && line.subtotal !== null);
    const total = selectedLines.reduce((acc, line) => acc + (line.subtotal as number), 0);
    const plannedCalories = selectedLines.reduce((acc, line) => acc + (line.plannedCalories ?? 0), 0);

    const byStore: Record<string, number> = {};
    const plannedByCategory: Record<string, number> = {};
    for (const line of selectedLines) {
      const store = line.selected?.storeName;
      if (store) {
        byStore[store] = (byStore[store] ?? 0) + (line.subtotal as number);
      }
      plannedByCategory[line.category] = (plannedByCategory[line.category] ?? 0) + (line.plannedCalories ?? 0);
    }

    const categoryTargets = Object.entries(CATEGORY_CALORIE_SHARE).map(([category, share]) => ({
      category,
      share,
      targetCalories: this.roundNumber(targetCalories * share, 0),
      plannedCalories: this.roundNumber(plannedByCategory[category] ?? 0, 0),
    }));

    const unresolved = drafts
      .filter((line) => !line.selected)
      .map((line) => line.requested);

    return {
      mode: 'calorie-plan',
      periodDays,
      targetCalories,
      targetRangeCalories: {
        min: this.roundNumber((48000 / DEFAULT_PERIOD_DAYS) * periodDays, 0),
        max: this.roundNumber((90000 / DEFAULT_PERIOD_DAYS) * periodDays, 0),
      },
      plannedCalories: this.roundNumber(plannedCalories, 0),
      categoryTargets,
      requestedItems: requestedItems.length,
      resolvedItems: selectedLines.length,
      unresolvedItems: unresolved,
      totalEstimated: total,
      estimatedByStore: byStore,
      lines: drafts.map(({ candidates, ...line }) => line),
    };
  }

  private getCandidateRanking(product: string, canonicalAll: CanonicalProduct[]): RankedProduct[] {
    const targetTokens = this.getTargetMatchTokens(product);
    const relevant: Array<CanonicalProduct & { relevanceScore: number }> = canonicalAll
      .map((p) => {
        const targetedProduct = this.withNutritionTarget(p, product);

        return {
          ...targetedProduct,
          relevanceScore: this.computeTextMatchScore(targetTokens, targetedProduct.canonicalTokens),
        };
      })
      .filter((p) => p.price !== null && p.relevanceScore > 0.2 && this.isRelevantForTarget(product, p));

    return this.withValueScores(relevant)
      .sort((a, b) => {
        const byScore = b.matchScore - a.matchScore;
        if (byScore !== 0) {
          return byScore;
        }
        return (a.pricePerUnit ?? Number.MAX_SAFE_INTEGER) - (b.pricePerUnit ?? Number.MAX_SAFE_INTEGER);
      });
  }

  private getTargetMatchTokens(product: string): string[] {
    const normalizedTarget = this.normalizeText(product);
    const rule = PRODUCT_RULES[normalizedTarget];
    const tokens = new Set(this.toCanonicalTokens(product));

    rule?.all?.forEach((token) => {
      this.toCanonicalTokens(token).forEach((expandedToken) => tokens.add(expandedToken));
    });

    rule?.any?.forEach((token) => {
      this.toCanonicalTokens(token).forEach((expandedToken) => tokens.add(expandedToken));
    });

    return [...tokens].sort();
  }

  private pickBestCalorieValue(candidates: RankedProduct[]): RankedProduct | null {
    const pricedCalories = candidates.filter((candidate) =>
      candidate.price !== null &&
      candidate.price > 0 &&
      candidate.nutrition.calories !== null &&
      candidate.nutrition.calories > 0
    );

    if (pricedCalories.length === 0) {
      return null;
    }

    return [...pricedCalories].sort((a, b) => {
      const caloriePriceDiff = (a.pricePerCalorie ?? Number.MAX_SAFE_INTEGER) - (b.pricePerCalorie ?? Number.MAX_SAFE_INTEGER);
      if (caloriePriceDiff !== 0) {
        return caloriePriceDiff;
      }

      const byScore = b.matchScore - a.matchScore;
      if (byScore !== 0) {
        return byScore;
      }

      return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER);
    })[0] ?? null;
  }

  private pickLowestPriceCandidate(candidates: RankedProduct[]): RankedProduct | null {
    const pricedCandidates = candidates.filter((candidate) => candidate.price !== null && candidate.price > 0);
    if (pricedCandidates.length === 0) {
      return null;
    }

    const comparableByPresentation = pricedCandidates.filter((candidate) =>
      candidate.pricePerUnit !== null &&
      candidate.pricePerUnit > 0 &&
      candidate.presentation.baseUnit !== 'und'
    );
    const candidatesToSort = comparableByPresentation.length > 0 ? comparableByPresentation : pricedCandidates;

    return [...candidatesToSort].sort((a, b) => {
      if (comparableByPresentation.length > 0) {
        const byUnitPrice = (a.pricePerUnit as number) - (b.pricePerUnit as number);
        if (byUnitPrice !== 0) {
          return byUnitPrice;
        }
      }

      const byRawPrice = (a.price as number) - (b.price as number);
      if (byRawPrice !== 0) {
        return byRawPrice;
      }

      return b.matchScore - a.matchScore;
    })[0] ?? null;
  }

  private withNutritionTarget(product: CanonicalProduct, nutritionTarget: string): CanonicalProduct {
    const nutrition = this.estimateNutrition(nutritionTarget, product.presentation, product.normalizedName);
    const pricePerCalorie = product.price !== null &&
      product.price > 0 &&
      nutrition.calories !== null &&
      nutrition.calories > 0
        ? this.roundNumber(product.price / nutrition.calories, 4)
        : null;

    return {
      ...product,
      nutrition,
      pricePerCalorie,
    };
  }

  private pickCaloriePlanForTarget(
    candidates: RankedProduct[],
    targetCalories: number,
  ): { selected: RankedProduct; quantity: number; plannedCalories: number; subtotal: number } | null {
    const plans = candidates
      .filter((candidate) =>
        candidate.price !== null &&
        candidate.price > 0 &&
        candidate.nutrition.calories !== null &&
        candidate.nutrition.calories > 0
      )
      .map((candidate) => {
        const calories = candidate.nutrition.calories as number;
        const quantity = Math.max(1, Math.ceil(targetCalories / calories));
        const plannedCalories = this.roundNumber(quantity * calories, 0);
        const subtotal = (candidate.price as number) * quantity;
        const overageRatio = plannedCalories / targetCalories;

        return {
          selected: candidate,
          quantity,
          plannedCalories,
          subtotal,
          overageRatio,
          calorieOverage: plannedCalories - targetCalories,
        };
      });

    if (plans.length === 0) {
      return null;
    }

    const bestPlan = [...plans].sort((a, b) => {
      const aLargeOverage = a.overageRatio > 1.75 ? 1 : 0;
      const bLargeOverage = b.overageRatio > 1.75 ? 1 : 0;
      if (aLargeOverage !== bLargeOverage) {
        return aLargeOverage - bLargeOverage;
      }

      const bySubtotal = a.subtotal - b.subtotal;
      if (bySubtotal !== 0) {
        return bySubtotal;
      }

      const byOverage = a.calorieOverage - b.calorieOverage;
      if (byOverage !== 0) {
        return byOverage;
      }

      return b.selected.matchScore - a.selected.matchScore;
    })[0];

    return {
      selected: bestPlan.selected,
      quantity: bestPlan.quantity,
      plannedCalories: bestPlan.plannedCalories,
      subtotal: bestPlan.subtotal,
    };
  }

  private toCanonicalProduct(raw: RawScraped, nutritionTarget = raw.query): CanonicalProduct {
    const normalizedName = this.normalizeText(raw.name);
    const canonicalTokens = this.toCanonicalTokens(raw.name);
    const presentation = this.extractPresentation(raw.name);
    const availability = raw.availability ?? raw.price !== null;
    const price = raw.price ?? null;
    const nutrition = this.estimateNutrition(nutritionTarget, presentation, normalizedName);

    let pricePerUnit: number | null = null;
    if (price !== null && presentation.baseAmount && presentation.baseAmount > 0) {
      pricePerUnit = Number((price / presentation.baseAmount).toFixed(2));
    }

    let pricePerCalorie: number | null = null;
    if (price !== null && price > 0 && nutrition.calories !== null && nutrition.calories > 0) {
      pricePerCalorie = this.roundNumber(price / nutrition.calories, 4);
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
      nutrition,
      pricePerUnit,
      pricePerCalorie,
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
      const unitOnlyMatch = normalized.match(/\b(?:x|por)\s*(kg|kilo|kilos|lb|libra|libras|und|unidad|unidades|u)\b/);
      if (unitOnlyMatch) {
        const unitRaw = unitOnlyMatch[1];
        const unit = ['kilo', 'kilos'].includes(unitRaw)
          ? 'kg'
          : ['libra', 'libras'].includes(unitRaw)
          ? 'lb'
          : ['unidad', 'unidades', 'u'].includes(unitRaw)
          ? 'und'
          : unitRaw;
        const base = this.toBasePresentationAmount(1, unit);

        return {
          amount: 1,
          unit,
          label: `1 ${unit}`,
          baseAmount: base.amount,
          baseUnit: base.unit,
        };
      }

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

  private estimateNutrition(
    productQuery: string,
    presentation: CanonicalProduct['presentation'],
    normalizedName: string,
  ): CanonicalProduct['nutrition'] {
    const productKey = this.resolveCalorieReferenceKey(productQuery);
    const empty = {
      calories: null,
      caloriesPerBaseUnit: null,
      calorieBaseUnit: null,
      label: null,
      source: null,
    };

    if (!productKey) {
      return empty;
    }

    const reference = CALORIE_REFERENCES[productKey];
    const baseUnit = presentation.baseUnit as BaseUnit | null;
    const caloriesPerBaseUnit = baseUnit
      ? this.caloriesPerBaseUnit(reference, baseUnit, productKey, normalizedName)
      : null;

    if (caloriesPerBaseUnit === null) {
      return {
        calories: null,
        caloriesPerBaseUnit: null,
        calorieBaseUnit: baseUnit,
        label: null,
        source: null,
      };
    }

    if (!presentation.baseAmount || presentation.baseAmount <= 0) {
      return {
        calories: null,
        caloriesPerBaseUnit,
        calorieBaseUnit: baseUnit,
        label: `${this.roundNumber(caloriesPerBaseUnit, 0)} kcal/${baseUnit}`,
        source: 'estimated',
      };
    }

    const calories = this.roundNumber(presentation.baseAmount * caloriesPerBaseUnit, 0);

    return {
      calories,
      caloriesPerBaseUnit,
      calorieBaseUnit: baseUnit,
      label: `${calories} kcal aprox.`,
      source: 'estimated',
    };
  }

  private resolveCalorieReferenceKey(productQuery: string): string | null {
    const normalized = this.normalizeText(productQuery);
    if (CALORIE_REFERENCES[normalized]) {
      return normalized;
    }

    if (normalized === 'lenteja') {
      return 'lentejas';
    }

    if (normalized === 'huevo') {
      return 'huevos';
    }

    if (normalized === 'aceite') {
      return 'aceite vegetal';
    }

    return null;
  }

  private caloriesPerBaseUnit(
    reference: CalorieReference,
    baseUnit: BaseUnit,
    productKey: string,
    normalizedName: string,
  ): number | null {
    if ((productKey === 'huevos' || productKey === 'huevo') && baseUnit === 'und') {
      return normalizedName.includes('codorniz') ? 14 : reference.caloriesPerUnit ?? null;
    }

    if (productKey === 'leche' && baseUnit === 'kg' && normalizedName.includes('polvo')) {
      return reference.caloriesPerKgDense ?? reference.caloriesPerKg ?? null;
    }

    if (baseUnit === 'kg') {
      return reference.caloriesPerKg ?? null;
    }
    if (baseUnit === 'l') {
      return reference.caloriesPerL ?? null;
    }
    if (baseUnit === 'und') {
      return reference.caloriesPerUnit ?? null;
    }
    return null;
  }

  private roundNumber(value: number, decimals: number): number {
    return Number(value.toFixed(decimals));
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
    const hasNonGrocerySignal = candidateTokens.some((token) => !targetSet.has(token) && this.isNonGroceryToken(token));
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

    if (this.hasFreshProduceDerivativeNoise(targetNorm, name)) {
      return false;
    }

    if (this.hasBaseDerivativeNoise(targetNorm, tokens, name)) {
      return false;
    }

    if (rule.excludeStems?.some((stem) => name.includes(stem))) {
      return false;
    }

    if (rule.excludeTokens?.some((token) => tokens.has(token))) {
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
      return allowed.some((stem) => name.includes(stem)) || name.startsWith('leche ');
    }

    return true;
  }

  private hasBaseDerivativeNoise(targetNorm: string, tokens: Set<string>, normalizedName: string): boolean {
    if (BASE_PRODUCT_DERIVATIVE_STEMS.some((stem) => normalizedName.includes(stem))) {
      return true;
    }

    if (targetNorm !== 'pan' && tokens.has('pan')) {
      return true;
    }

    return false;
  }

  private hasFreshProduceDerivativeNoise(targetNorm: string, normalizedName: string): boolean {
    if (!FRESH_PRODUCE_TARGETS.has(targetNorm)) {
      return false;
    }

    return FRESH_PRODUCE_DERIVATIVE_STEMS.some((stem) => normalizedName.includes(stem));
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

  private storeKey(storeName: string): string {
    const normalized = this.normalizeText(storeName);
    if (normalized.includes('d1')) {
      return 'd1';
    }
    if (normalized.includes('exito')) {
      return 'exito';
    }
    if (normalized.includes('carulla')) {
      return 'carulla';
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
