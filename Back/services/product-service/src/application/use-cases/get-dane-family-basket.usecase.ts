export type DaneFamilyBasketItem = {
  product: string;
  quantity: number;
  category: string;
  unit: string | null;
};

export const DANE_FAMILY_BASKET: DaneFamilyBasketItem[] = [
  { product: 'arroz', quantity: 1, category: 'Cereales y harinas', unit: 'kg' },
  { product: 'pasta', quantity: 1, category: 'Cereales y harinas', unit: 'kg' },
  { product: 'harina de trigo', quantity: 1, category: 'Cereales y harinas', unit: 'kg' },
  { product: 'harina de maiz', quantity: 1, category: 'Cereales y harinas', unit: 'kg' },
  { product: 'pan', quantity: 1, category: 'Cereales y harinas', unit: 'unidad' },
  { product: 'galletas de sal', quantity: 1, category: 'Cereales y harinas', unit: 'paquete' },
  { product: 'avena', quantity: 1, category: 'Cereales y harinas', unit: 'kg' },
  { product: 'papa', quantity: 1, category: 'Tubérculos y plátanos', unit: 'kg' },
  { product: 'yuca', quantity: 1, category: 'Tubérculos y plátanos', unit: 'kg' },
  { product: 'platano verde', quantity: 1, category: 'Tubérculos y plátanos', unit: 'kg' },
  { product: 'frijol', quantity: 1, category: 'Legumbres', unit: 'kg' },
  { product: 'lentejas', quantity: 1, category: 'Legumbres', unit: 'kg' },
  { product: 'arveja seca', quantity: 1, category: 'Legumbres', unit: 'kg' },
  { product: 'tomate', quantity: 1, category: 'Verduras y hortalizas', unit: 'kg' },
  { product: 'cebolla cabezona', quantity: 1, category: 'Verduras y hortalizas', unit: 'kg' },
  { product: 'cebolla larga', quantity: 1, category: 'Verduras y hortalizas', unit: 'kg' },
  { product: 'zanahoria', quantity: 1, category: 'Verduras y hortalizas', unit: 'kg' },
  { product: 'habichuela', quantity: 1, category: 'Verduras y hortalizas', unit: 'kg' },
  { product: 'banano', quantity: 1, category: 'Frutas', unit: 'kg' },
  { product: 'naranja', quantity: 1, category: 'Frutas', unit: 'kg' },
  { product: 'limon', quantity: 1, category: 'Frutas', unit: 'kg' },
  { product: 'guayaba', quantity: 1, category: 'Frutas', unit: 'kg' },
  { product: 'mora', quantity: 1, category: 'Frutas', unit: 'kg' },
  { product: 'maracuya', quantity: 1, category: 'Frutas', unit: 'kg' },
  { product: 'tomate de arbol', quantity: 1, category: 'Frutas', unit: 'kg' },
  { product: 'carne de res', quantity: 1, category: 'Proteínas', unit: 'kg' },
  { product: 'carne de cerdo', quantity: 1, category: 'Proteínas', unit: 'kg' },
  { product: 'pollo', quantity: 1, category: 'Proteínas', unit: 'kg' },
  { product: 'pescado', quantity: 1, category: 'Proteínas', unit: 'kg' },
  { product: 'huevos', quantity: 1, category: 'Proteínas', unit: 'docena' },
  { product: 'leche', quantity: 1, category: 'Lácteos', unit: 'l' },
  { product: 'queso campesino', quantity: 1, category: 'Lácteos', unit: 'kg' },
  { product: 'aceite vegetal', quantity: 1, category: 'Grasas y complementos', unit: 'l' },
  { product: 'margarina', quantity: 1, category: 'Grasas y complementos', unit: 'kg' },
  { product: 'mantequilla', quantity: 1, category: 'Grasas y complementos', unit: 'kg' },
  { product: 'azucar', quantity: 1, category: 'Endulzantes y básicos', unit: 'kg' },
  { product: 'panela', quantity: 1, category: 'Endulzantes y básicos', unit: 'kg' },
  { product: 'sal', quantity: 1, category: 'Endulzantes y básicos', unit: 'kg' },
  { product: 'cafe', quantity: 1, category: 'Bebidas y otros', unit: '250 g' },
];

export class GetDaneFamilyBasketUseCase {
  execute() {
    return DANE_FAMILY_BASKET;
  }
}
