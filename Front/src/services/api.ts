import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:3006/api`
    : 'http://localhost:3006/api')

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// -------- AUTH SERVICE --------
export const authService = {
  login: (email: string, password: string) =>
    api.post('/orchestrator/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post('/orchestrator/register', { name, email, password }),
}

// -------- ORCHESTRATOR SERVICE --------
export const orchestratorService = {
  // PRODUCT CRUD
  getProductList: () =>
    api.get('/orchestrator/products'),

  createProduct: (name: string) =>
    api.post('/orchestrator/products', { name }),

  deleteProduct: (name: string) =>
    api.delete('/orchestrator/products', { data: { name } }),

  // SCRAPING
  refreshScraping: () =>
    api.post('/orchestrator/refresh-scraping'),

  getScrapingJobStatus: (jobId: string) =>
    api.get(`/orchestrator/scraping-jobs/${jobId}`),

  // DASHBOARD
  getDashboard: () =>
    api.get('/orchestrator/dashboard'),

  getPriceStats: (filters: { query?: string; storeName?: string; days?: number } = {}) =>
    api.get('/orchestrator/stats/price', { params: filters }),

  getPriceSeries: (filters: { query?: string; storeName?: string; days?: number } = {}) =>
    api.get('/orchestrator/stats/price-series', { params: filters }),

  getResearchBasket: () =>
    api.get('/orchestrator/research/dane-basket'),

  // ----- SEARCH FILTERS -----

  // /search/availability?availability=true
  searchByAvailability: (availability: string) =>
    api.get('/orchestrator/search/availability', {
      params: { availability },
    }),

  // /search/query/<query>
  searchByQuery: (query: string) =>
    api.get(`/orchestrator/search/query/${query}`),

  // /search/store/<storeName>
  searchByStore: (storeName: string) =>
    api.get(`/orchestrator/search/store/${storeName}`),

  // /search/name?name=Arroz
  searchByName: (name: string) =>
    api.get('/orchestrator/search/name', {
      params: { name },
    }),

  // COMPARISON ENGINE
  compareProduct: (product: string) =>
    api.get(`/orchestrator/compare/${encodeURIComponent(product)}`),

  optimizeList: (items: Array<{ product: string; quantity?: number }>) =>
    api.post('/orchestrator/optimize-list', { items }),

  optimizeFullCatalog: () =>
    api.post('/orchestrator/optimize-list', {}),
}




