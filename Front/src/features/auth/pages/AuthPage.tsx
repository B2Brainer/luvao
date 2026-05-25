import { useState } from 'react'
import { authService } from '../../../services/api'
import { useNavigate } from 'react-router-dom'
import '../styles/Auth.css'

function errorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  return 'Error en la operación'
}

export function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // 👉 Login real contra el orchestrator
        await authService.login(email, password)
        navigate('/products') // Entrar a la app
      } else {
        // 👉 Registro real
        await authService.register(name, email, password)
        setIsLogin(true) // Cambiar a login una vez registrado
      }
    } catch (err: unknown) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-hero">
        <img src="/brand/logo-front-transparent-clean.png" alt="Luvao" className="auth-logo" />
      </div>

      <div className="auth-box">
        <div className="auth-switch" aria-label="Seleccionar acceso">
          <button
            type="button"
            className={isLogin ? 'active' : ''}
            onClick={() => setIsLogin(true)}
            aria-pressed={isLogin}
          >
            Entrar
          </button>
          <button
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => setIsLogin(false)}
            aria-pressed={!isLogin}
          >
            Crear cuenta
          </button>
        </div>

        <div className="auth-copy">
          <h2>{isLogin ? 'Entrar al panel' : 'Abrir tu cuenta'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <label className="auth-field">
              <span>Nombre</span>
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                autoComplete="name"
                required
              />
            </label>
          )}

          <label className="auth-field">
            <span>Correo electrónico</span>
            <input
              type="email"
              placeholder="nombre@correo.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field">
            <span>Contraseña</span>
            <input
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading
              ? 'Cargando...'
              : isLogin
              ? 'Entrar al panel'
              : 'Crear mi cuenta'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}

export default Auth
