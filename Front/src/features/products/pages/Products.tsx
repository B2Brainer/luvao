import { useState } from 'react'
import { orchestratorService } from '../../../services/api'
import '../styles/Products.css'

function Products() {
  const [newProduct, setNewProduct] = useState('')
  const [deleteProductName, setDeleteProductName] = useState('')

  // Filtros
  const [availability, setAvailability] = useState('')
  const [query, setQuery] = useState('')
  const [storeName, setStoreName] = useState('')
  const [searchName, setSearchName] = useState('')

  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async (fn: () => Promise<void>) => {
    setLoading(true)
    setError('')
    try {
      await fn()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en la operación')
    } finally {
      setLoading(false)
    }
  }

  // ---- CRUD PRODUCTOS ----
  const handleCreateProduct = async () => {
    if (!newProduct.trim()) return
    run(async () => {
      const res = await orchestratorService.createProduct(newProduct)
      setResult(res.data)
      setNewProduct('')
    })
  }

  const handleDeleteProduct = async () => {
    if (!deleteProductName.trim()) return
    run(async () => {
      const res = await orchestratorService.deleteProduct(deleteProductName)
      setResult(res.data)
      setDeleteProductName('')
    })
  }

  // ---- SCRAPING ----
  const handleScrape = async () => {
    run(async () => {
      const res = await orchestratorService.refreshScraping()
      setResult(res.data)
    })
  }

  const handleDashboard = async () => {
    run(async () => {
      const res = await orchestratorService.getDashboard()
      setResult(res.data)
    })
  }

  // ---- FILTROS ----
  const handleSearchAvailability = async () => {
    if (!availability) return
    run(async () => {
      const res = await orchestratorService.searchByAvailability(availability)
      setResult(res.data)
      setAvailability('')
    })
  }

  const handleSearchQuery = async () => {
    if (!query.trim()) return
    run(async () => {
      const res = await orchestratorService.searchByQuery(query)
      setResult(res.data)
      setQuery('')
    })
  }

  const handleSearchStore = async () => {
    if (!storeName.trim()) return
    run(async () => {
      const res = await orchestratorService.searchByStore(storeName)
      setResult(res.data)
      setStoreName('')
    })
  }

  const handleSearchName = async () => {
    if (!searchName.trim()) return
    run(async () => {
      const res = await orchestratorService.searchByName(searchName)
      setResult(res.data)
      setSearchName('')
    })
  }

  return (
    <div className="home-container">
      <h1>Panel de Control</h1>

      {/* CREAR PRODUCTO */}
      <div className="card">
        <h2>Agregar producto</h2>
        <input
          type="text"
          placeholder="Nombre del producto"
          value={newProduct}
          onChange={(e) => setNewProduct(e.target.value)}
        />
        <button className="small-btn" onClick={handleCreateProduct} disabled={loading}>
          Crear Producto
        </button>
      </div>

      {/* ELIMINAR PRODUCTO */}
      <div className="card">
        <h2>Eliminar producto</h2>
        <input
          type="text"
          placeholder="Nombre del producto"
          value={deleteProductName}
          onChange={(e) => setDeleteProductName(e.target.value)}
        />
        <button className="small-btn" onClick={handleDeleteProduct} disabled={loading}>
          Eliminar Producto
        </button>
      </div>

      {/* SCRAPING MANUAL */}
      <div className="card">
        <h2>Scraping manual</h2>
        <button className="small-btn" onClick={handleScrape} disabled={loading}>
          Ejecutar Scraping
        </button>
      </div>

      {/* DASHBOARD */}
      <div className="card">
        <h2>Dashboard Scrapeado</h2>
        <button className="small-btn" onClick={handleDashboard} disabled={loading}>
          Obtener Dashboard
        </button>
      </div>

      {/* FILTROS */}
      <div className="card">
        <h2>Filtros de Búsqueda</h2>

        {/* Disponibilidad */}
        <input
          type="text"
          placeholder="availability: true/false"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
        <button className="small-btn" onClick={handleSearchAvailability} disabled={loading}>
          Filtrar por Disponibilidad
        </button>

        {/* Query */}
        <input
          type="text"
          placeholder="Query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="small-btn" onClick={handleSearchQuery} disabled={loading}>
          Buscar por Query
        </button>

        {/* Tienda */}
        <input
          type="text"
          placeholder="Store Name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />
        <button className="small-btn" onClick={handleSearchStore} disabled={loading}>
          Buscar por Tienda
        </button>

        {/* Nombre */}
        <input
          type="text"
          placeholder="Nombre del producto"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <button className="small-btn" onClick={handleSearchName} disabled={loading}>
          Buscar por Nombre
        </button>
      </div>

      {/* RESULTADOS */}
      {(loading || result || error) && (
        <div className="result-box">
          {loading && <p>Cargando...</p>}
          {error && <p className="error">{error}</p>}
          {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
        </div>
      )}
    </div>
  )
}

export default Products

