import { useState } from 'react'
import { authService } from '../../../services/api'
import { useNavigate } from 'react-router-dom'
import '../styles/Auth.css'

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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en la operación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-hero">
        <img src="/brand/logo-paleta.png" alt="Luvao" className="auth-logo" />
        <h1>Comparar precios con base en la canasta DANE.</h1>
        <p>
          Una interfaz limpia para investigar el mercado, leer variaciones de precio y presentar resultados con claridad.
        </p>
        <div className="auth-pills">
          <span>Investigación</span>
          <span>Estadística descriptiva</span>
          <span>Comparación real</span>
        </div>
      </div>

      <div className="auth-box">
        <div className="auth-copy">
          <span className="auth-kicker">Acceso seguro</span>
          <h2>{isLogin ? 'Entrar al panel' : 'Crear cuenta'}</h2>
          <p>{isLogin ? 'Ingresa para revisar comparativas, canasta DANE y estadísticas del mercado.' : 'Regístrate para trabajar sobre el panel de análisis.'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              required
            />
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? 'Cargando...'
              : isLogin
              ? 'Entrar'
              : 'Registrarse'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <p className="toggle-copy">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-btn"
          >
            {isLogin ? 'Registrarse' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth

