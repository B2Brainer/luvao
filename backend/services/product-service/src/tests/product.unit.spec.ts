describe('Product basic logic', () => {
  it('should create a product object', () => {
    const product = { id: 1, name: 'Arroz', price: 100 };
    expect(product.name).toBe('Arroz');
  });
});
