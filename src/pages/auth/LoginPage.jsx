import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import authService from '@/services/authService'

// UI
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Alert from '@/components/ui/Alert'

// Icons
import AtSignIcon from '@/assets/icons/AtSignIcon'
import LockIcon from '@/assets/icons/LockIcon'

import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }))
    }

    if (error) setError(null)
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Ingresa un correo electrónico válido'
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    return errors
  }

  const parseBackendError = (err) => {
    if (!err.response) {
      return 'No hay conexión con el servidor. Revisa tu internet.'
    }

    const status = err.response.status
    const data = err.response.data

    switch (status) {
      case 400:
        return data?.message || 'Solicitud inválida.'
      case 401:
        return 'Credenciales incorrectas. Intenta de nuevo.'
      case 403:
        return 'No tienes permisos para acceder.'
      case 422:
        if (data?.errors) {
          const formatted = {}
          Object.keys(data.errors).forEach(key => {
            formatted[key] = data.errors[key][0]
          })
          setFieldErrors(formatted)
          return 'Corrige los campos marcados.'
        }
        return data?.message || 'Datos inválidos.'
      case 500:
        return 'Error interno del servidor. Intenta más tarde.'
      default:
        return data?.message || 'Ocurrió un error inesperado.'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      const payload = await authService.login(formData.email, formData.password)

      if (payload && payload.success === false) {
        throw new Error(payload.message || 'Credenciales inválidas')
      }
        // Extraer datos reales (depende de tu backend; aquí asumo payload.data.usuario y tokens)
        const usuario = payload.data?.usuario || payload.data?.user || null
        const access_token = payload.data?.access_token || payload.data?.token || null
        const refresh_token = payload.data?.refresh_token || null

        if (!usuario || !access_token) {
          // defensivo: si faltan datos, lanzar
          throw new Error('Respuesta inválida del servidor al iniciar sesión')
        }

        login(
          usuario,
          {
            access_token,
            refresh_token
          },
          formData.rememberMe
        )

        navigate('/dashboard')
      } catch (err) {
        // log para depuración (opcional, eliminar en producción)
        console.error('Login error ->', err)

        // Mostrar el mensaje ya normalizado en authService
        setError(err.message || 'Error al iniciar sesión. Intenta nuevamente.')

        // Si hay errores de validación estructurados desde backend (422) los podemos mostrar en los campos
        if (err.validation) {
          // Mapear errores a fieldErrors si vienen en formato conocido
          // Ejemplo: { email: ['msg1'], password: ['msg2'] } o Pydantic detail array
          if (typeof err.validation === 'object' && !Array.isArray(err.validation)) {
            const fieldErrs = {}
            Object.keys(err.validation).forEach(k => {
              const v = err.validation[k]
              fieldErrs[k] = Array.isArray(v) ? v[0] : String(v)
            })
            setFieldErrors(fieldErrs)
          } else if (Array.isArray(err.validation)) {
            // pydantic detail -> convertir a mensajes generales
            setError(prev => `${prev} ${err.validation.map(d => d.msg || d.message).join(', ')}`)
          }
        }
      } finally {
        setLoading(false)
      }
    }

  return (
    <div className="login-page-modern">
      <div className="login-card-modern">

        <div className="login-card-modern__header">
          <h1 className="login-card-modern__title">Bienvenido de vuelta</h1>
          <p className="login-card-modern__subtitle">
            Accede a tu cuenta de clínica veterinaria
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form-modern">

          {error && (
            <Alert type="error" message={error} onClose={() => setError(null)} />
          )}

          <Input
            label="Correo Electrónico"
            type="email"
            name="email"
            placeholder="admin@gdcv.com"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
            icon={<AtSignIcon />}
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            icon={<LockIcon />}
          />

          <div className="login-form-modern__options">
            <Checkbox
              label="Recordarme"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
          </div>

          <Button fullWidth type="submit" loading={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>

          <div className="login-form-modern__divider">
            <span>¿Primera vez aquí?</span>
          </div>

          <Link to="/registro" className="login-form-modern__register-link">
            Crear una cuenta nueva
          </Link>
        </form>

      </div>
    </div>
  )
}

export default LoginPage
