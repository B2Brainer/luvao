export type DaneFamilyBasketItem = {
  product: string;
  quantity: number;
  category: string;
  unit: string | null;
};

const DANE_FAMILY_BASKET: DaneFamilyBasketItem[] = [
  { product: 'arroz', quantity: 1, category: 'cereales y granos', unit: 'kg' },
  { product: 'aceite vegetal', quantity: 1, category: 'grasas y aceites', unit: 'l' },
  { product: 'leche', quantity: 1, category: 'lacteos', unit: 'l' },
  { product: 'huevos', quantity: 1, category: 'proteinas', unit: 'docena' },
  { product: 'azucar', quantity: 1, category: 'endulzantes', unit: 'kg' },
  { product: 'cafe', quantity: 1, category: 'bebidas', unit: '250 g' },
  { product: 'pasta', quantity: 1, category: 'cereales y granos', unit: 'kg' },
  { product: 'frijol', quantity: 1, category: 'cereales y granos', unit: 'kg' },
  { product: 'papa', quantity: 1, category: 'hortalizas', unit: 'kg' },
  { product: 'tomate', quantity: 1, category: 'hortalizas', unit: 'kg' },
  { product: 'cebolla', quantity: 1, category: 'hortalizas', unit: 'kg' },
  { product: 'pollo', quantity: 1, category: 'proteinas', unit: 'kg' },
  { product: 'carne molida', quantity: 1, category: 'proteinas', unit: 'kg' },
  { product: 'pan', quantity: 1, category: 'cereales y granos', unit: 'unidad' },
  { product: 'sal', quantity: 1, category: 'condimentos', unit: 'kg' },
  { product: 'harina', quantity: 1, category: 'cereales y granos', unit: 'kg' },
  { product: 'avena', quantity: 1, category: 'cereales y granos', unit: 'kg' },
];

export class GetDaneFamilyBasketUseCase {
  execute() {
    return DANE_FAMILY_BASKET;
  }
}