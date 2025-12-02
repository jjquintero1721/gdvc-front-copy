import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/AuthStore.jsx'
import authService from '@/services/authService'

// UI
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'

// Icons
import AtSignIcon from '@/assets/icons/AtSignIcon'
import LockIcon from '@/assets/icons/LockIcon'

// Toast
import { useToastContext } from '@/components/ui/ToastProvider'

import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const toast = useToastContext()   // ← usamos el ToastProvider

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldErrors({})

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast("error", "Corrige los campos marcados.")
      return
    }

    setLoading(true)

    try {
      const payload = await authService.login(formData.email, formData.password)

      if (payload && payload.success === false) {
        throw new Error(payload.message || 'Credenciales inválidas')
      }

      const usuario = payload.data?.usuario || payload.data?.user || null
      const access_token = payload.data?.access_token || payload.data?.token || null
      const refresh_token = payload.data?.refresh_token || null

      if (!usuario || !access_token) {
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

      toast("success", "Inicio de sesión exitoso.")
      navigate('/dashboard')

    } catch (err) {
      console.error('Login error ->', err)

      if (err.status === 429) {
        toast("error", err.message || "Cuenta bloqueada temporalmente por intentos fallidos.")
        return
      }

      // errores backend con validaciones 422
      if (err.validation) {
        const fieldErrs = {}

        if (typeof err.validation === 'object' && !Array.isArray(err.validation)) {
          Object.keys(err.validation).forEach(k => {
            const v = err.validation[k]
            fieldErrs[k] = Array.isArray(v) ? v[0] : String(v)
          })
          setFieldErrors(fieldErrs)
        }

        toast("error", "Corrige los campos marcados.")
      } else {
        toast("error", err.message || "Error al iniciar sesión.")
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
            <Link
              to="/reset-password"
              className="login-form-modern__forgot"
            >
              ¿Olvidaste tu contraseña?
            </Link>

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
