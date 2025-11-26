// orchestrator.config.ts
export const SERVICES = {
  USER: 'http://user-service:3003',      // ✅ Corregido
  PRODUCT: 'http://product-service:3002', // ✅ Correcto
  STORES: 'http://stores-service:3001',   // ✅ Corregido  
  SCRAPED: 'http://scraped-service:3005', // ✅ Corregido
  CRAWLER: 'http://crawler-service:3004', // ✅ Corregido
};
