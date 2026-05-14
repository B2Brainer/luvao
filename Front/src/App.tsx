// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Auth } from './features/auth/pages/AuthPage'
import Products from './features/products/pages/Products'
import Header from './features/products/components/Header'
import Statistics from './features/statistics/pages/Statistics'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 👉 Si entra a "/", redirige a /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            <AuthLayout>
              <Auth />
            </AuthLayout>
          }
        />

        <Route
          path="/products"
          element={
            <MainLayout>
              <Products />
            </MainLayout>
          }
        />

        <Route
          path="/statistics"
          element={
            <MainLayout>
              <Statistics />
            </MainLayout>
          }
        />

        {/* cualquier ruta rara → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="app-background">{children}</div>
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root">
      <Header />
      <main className="main-layout">{children}</main>
    </div>
  )
}

export default App
