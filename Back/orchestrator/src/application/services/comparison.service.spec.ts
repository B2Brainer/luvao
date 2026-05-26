import { ComparisonService } from './comparison.service';

type MatchAuditCase = {
  query: string;
  validName: string;
  invalidName: string;
};

const makeCandidate = (id: string, query: string, name: string, price: number) => ({
  id,
  storeName: 'Exito',
  query,
  name,
  price,
  availability: true,
});

const basketAuditCases: MatchAuditCase[] = [
  { query: 'arroz', validName: 'Arroz Diana 1000 g', invalidName: 'Bebida de arroz sabor vainilla 1 l' },
  { query: 'pasta', validName: 'Pasta Doria spaghetti 500 g', invalidName: 'Pasta de tomate 200 g' },
  { query: 'harina de trigo', validName: 'Harina de trigo Haz de Oros 1 kg', invalidName: 'Harina de maiz precocida 1 kg' },
  { query: 'harina de maiz', validName: 'Harina de maiz blanco 1 kg', invalidName: 'Harina de trigo 1 kg' },
  { query: 'pan', validName: 'Pan tajado blanco 500 g', invalidName: 'Panela pulverizada 500 g' },
  { query: 'galletas de sal', validName: 'Galletas de sal saltin noel 9 und', invalidName: 'Galleta rellena de chocolate 12 und' },
  { query: 'avena', validName: 'Avena en hojuelas 500 g', invalidName: 'Bebida de avena 1 l' },
  { query: 'papa', validName: 'Papa sabanera x kg', invalidName: 'Papa frita chips limon 105 g' },
  { query: 'yuca', validName: 'Yuca fresca x kg', invalidName: 'Yuca frita congelada 500 g' },
  { query: 'platano verde', validName: 'Platano verde x kg', invalidName: 'Platano maduro tajado 250 g' },
  { query: 'frijol', validName: 'Frijol cargamanto 500 g', invalidName: 'Salsa de frijol 200 g' },
  { query: 'lentejas', validName: 'Lenteja tradicional 500 g', invalidName: 'Sopa de lentejas 100 g' },
  { query: 'arveja seca', validName: 'Arveja seca verde 500 g', invalidName: 'Arveja congelada 500 g' },
  { query: 'tomate', validName: 'Tomate chonto x kg', invalidName: 'Salsa de tomate 400 g' },
  { query: 'cebolla cabezona', validName: 'Cebolla cabezona blanca x kg', invalidName: 'Cebolla larga manojo' },
  { query: 'cebolla larga', validName: 'Cebolla larga fresca manojo', invalidName: 'Cebolla larga en polvo 50 g' },
  { query: 'zanahoria', validName: 'Zanahoria fresca x kg', invalidName: 'Jugo de zanahoria 300 ml' },
  { query: 'habichuela', validName: 'Habichuela fresca x kg', invalidName: 'Habichuela enlatada 300 g' },
  { query: 'banano', validName: 'Banano bocadillo x kg', invalidName: 'Yogurt sabor banano 150 g' },
  { query: 'naranja', validName: 'Naranja tangelo x kg', invalidName: 'Te sabor naranja 20 und' },
  { query: 'limon', validName: 'Fruta limon tahiti x kg', invalidName: 'Te sabor limon 20 und' },
  { query: 'guayaba', validName: 'Guayaba pera x kg', invalidName: 'Galleta de guayaba 12 und' },
  { query: 'mora', validName: 'Mora x kg', invalidName: 'Gelatina Colanta Mora 120 g' },
  { query: 'maracuya', validName: 'Maracuya x kg', invalidName: 'Natilla de la abuela maracuya 300 g' },
  { query: 'tomate de arbol', validName: 'Tomate de arbol x kg', invalidName: 'Jugo de tomate de arbol 300 ml' },
  { query: 'carne de res', validName: 'Carne de res pulpa negra x kg', invalidName: 'Concentrado perro sabor carne de res 500 g' },
  { query: 'carne de cerdo', validName: 'Carne de cerdo lomo x kg', invalidName: 'Snack perro sabor carne de cerdo 100 g' },
  { query: 'pollo', validName: 'Pechuga de pollo x kg', invalidName: 'Caldo de pollo 12 cubos' },
  { query: 'pescado', validName: 'Filete de tilapia 500 g', invalidName: 'Alimento para gato sabor pescado 500 g' },
  { query: 'huevos', validName: 'Huevo rojo x 12 und', invalidName: 'Molde para huevos x 12 und' },
  { query: 'leche', validName: 'Leche entera uht 1 l', invalidName: 'Leche condensada 395 g' },
  { query: 'queso campesino', validName: 'Queso campesino fresco 500 g', invalidName: 'Arepa sabor queso campesino 300 g' },
  { query: 'aceite vegetal', validName: 'Aceite vegetal 1 l', invalidName: 'Aceite para motor 1 l' },
  { query: 'margarina', validName: 'Margarina mesa 500 g', invalidName: 'Mezcla sabor margarina 200 g' },
  { query: 'mantequilla', validName: 'Mantequilla alpina 250 g', invalidName: 'Papel mantequilla 30 h' },
  { query: 'azucar', validName: 'Azucar blanca 1 kg', invalidName: 'Brownie sin azucar 80 g' },
  { query: 'panela', validName: 'Panela pulverizada 500 g', invalidName: 'Galleta de panela 6 und' },
  { query: 'sal', validName: 'Sal marina 500 g', invalidName: 'Sal de frutas limon 12 und' },
  { query: 'cafe', validName: 'Cafe molido 250 g', invalidName: 'Bebida cafe latte 250 ml' },
];

const probableUserCases: MatchAuditCase[] = [
  { query: 'manzana', validName: 'Manzana roja x kg', invalidName: 'Compota de manzana 90 g' },
  { query: 'pera', validName: 'Pera conferencia x kg', invalidName: 'Nectar de pera 1 l' },
  { query: 'papaya', validName: 'Papaya hawaiana x kg', invalidName: 'Yogurt sabor papaya 150 g' },
  { query: 'mango', validName: 'Mango tommy x kg', invalidName: 'Mango para escoba de madera' },
  { query: 'ajo', validName: 'Ajo bulbo x kg', invalidName: 'Sal de ajo 120 g' },
  { query: 'cilantro', validName: 'Cilantro fresco manojo', invalidName: 'Salsa de cilantro 200 g' },
  { query: 'pepino', validName: 'Pepino cohombro x kg', invalidName: 'Jabon de pepino 90 g' },
  { query: 'atun', validName: 'Atun en agua 160 g', invalidName: 'Alimento para gato sabor atun 85 g' },
];

describe('ComparisonService', () => {
  const scrapedClient = {
    searchByFilters: jest.fn(),
  };

  const service = new ComparisonService(scrapedClient as never, {} as never);
  const serviceInternals = service as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(basketAuditCases)('mantiene coherencia semantica para %s', async ({ query, validName, invalidName }) => {
    scrapedClient.searchByFilters.mockResolvedValue([
      makeCandidate(`bad-${query}`, query, invalidName, 1900),
      makeCandidate(`good-${query}`, query, validName, 9800),
    ]);

    const result = await service.compareByProduct(query);

    expect(result.bestOverall?.sourceName).toBe(validName);
    expect(result.ranking.map((item) => item.sourceName)).toEqual([validName]);
  });

  it.each(probableUserCases)('filtra derivados y resultados no alimentarios para %s', async ({ query, validName, invalidName }) => {
    scrapedClient.searchByFilters.mockResolvedValue([
      makeCandidate(`bad-${query}`, query, invalidName, 1500),
      makeCandidate(`good-${query}`, query, validName, 8700),
    ]);

    const result = await service.compareByProduct(query);

    expect(result.bestOverall?.sourceName).toBe(validName);
    expect(result.ranking.map((item) => item.sourceName)).toEqual([validName]);
  });

  it.each([
    { query: 'arroz', name: 'Arroz Diana 450 g', expectedCalories: 495 },
    { query: 'pasta', name: 'Pasta spaghetti 500 g', expectedCalories: 775 },
    { query: 'avena', name: 'Avena en hojuelas 400 g', expectedCalories: 680 },
    { query: 'frijol', name: 'Frijol cargamanto 500 g', expectedCalories: 635 },
    { query: 'lentejas', name: 'Lentejas 500 g', expectedCalories: 580 },
    { query: 'arveja seca', name: 'Arveja seca 500 g', expectedCalories: 590 },
    { query: 'carne de res', name: 'Carne de res pulpa negra 500 g', expectedCalories: 1085 },
    { query: 'carne de cerdo', name: 'Carne de cerdo lomo 500 g', expectedCalories: 1105 },
    { query: 'pollo', name: 'Pechuga de pollo 500 g', expectedCalories: 825 },
    { query: 'pescado', name: 'Filete de tilapia 500 g', expectedCalories: 640 },
    { query: 'leche', name: 'Leche entera 1 l', expectedCalories: 610 },
    { query: 'leche', name: 'Leche en polvo 400 g', expectedCalories: 1984 },
    { query: 'queso campesino', name: 'Queso campesino fresco 500 g', expectedCalories: 1300 },
  ])('estima kcal recalibradas para %s en %s', ({ query, name, expectedCalories }) => {
    const presentation = serviceInternals.extractPresentation(name);
    const normalizedName = serviceInternals.normalizeText(name);
    const nutrition = serviceInternals.estimateNutrition(query, presentation, normalizedName);

    expect(nutrition.calories).toBe(expectedCalories);
    expect(nutrition.source).toBe('estimated');
  });

  it('recalcula un escenario estadistico para la ultima lista personalizada', async () => {
    scrapedClient.searchByFilters.mockResolvedValue([
      makeCandidate('arroz', 'arroz', 'Arroz Diana 500 g', 2500),
      makeCandidate('pollo', 'pollo', 'Pechuga de pollo 500 g', 9000),
    ])

    const result = await service.optimizeShoppingList(
      [
        { product: 'arroz', quantity: 2 },
        { product: 'pollo', quantity: 1 },
      ],
      { periodDays: 30, targetCalories: 3000 },
    )

    expect(result.mode).toBe('calorie-plan')
    expect(result.targetCalories).toBe(3000)
    expect(result.categoryTargets).toEqual([
      expect.objectContaining({
        category: 'Lista personalizada',
        targetCalories: 3000,
      }),
    ])
    expect(result.lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ requested: 'arroz', category: 'Lista personalizada', targetCalories: 2000 }),
        expect.objectContaining({ requested: 'pollo', category: 'Lista personalizada', targetCalories: 1000 }),
      ]),
    )
  })
});