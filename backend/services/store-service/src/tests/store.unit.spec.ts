// store-service/src/tests/store.unit.spec.ts

import { describe, it, expect } from '@jest/globals';

describe('Store basic logic', () => {
  it('should create a store object correctly', () => {
    const store = { id: 1, name: 'Éxito Buenavista', city: 'Barranquilla' };
    expect(store.name).toBe('Éxito Buenavista');
    expect(store.city).toBe('Barranquilla');
  });

  it('should update store city', () => {
    const store = { id: 1, name: 'Olímpica Prado', city: 'Barranquilla' };
    store.city = 'Soledad';
    expect(store.city).toBe('Soledad');
  });
});
