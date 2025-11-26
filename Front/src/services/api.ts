import axios from 'axios'

const API_BASE_URL = 'http://localhost:3006/api'

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
  createProduct: (name: string) =>
    api.post('/orchestrator/products', { name }),

  deleteProduct: (name: string) =>
    api.delete('/orchestrator/products', { data: { name } }),

  // SCRAPING
  refreshScraping: () =>
    api.post('/orchestrator/refresh-scraping'),

  // DASHBOARD
  getDashboard: () =>
    api.get('/orchestrator/dashboard'),

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
}




