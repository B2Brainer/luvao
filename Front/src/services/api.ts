import axios from 'axios'

const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1'])

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:3006/api'
  }

  if (LOCALHOST_HOSTNAMES.has(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.hostname}:3006/api`
  }

  return `${window.location.origin}/api`
}

const API_BASE_URL = getApiBaseUrl()

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

type OptimizeListItem = { product: string; quantity?: number }
type OptimizeListPayload = {
  items?: OptimizeListItem[]
  periodDays?: number
  targetCalories?: number
  restrictedStore?: string
}

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

  optimizeList: (payload: OptimizeListItem[] | OptimizeListPayload = []) =>
    api.post('/orchestrator/optimize-list', Array.isArray(payload) ? { items: payload } : payload),
}



