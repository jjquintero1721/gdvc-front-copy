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
    setError(null)

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      const response = await authService.login(formData.email, formData.password)

      login(
        response.data.usuario,
        {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token || null
        },
        formData.rememberMe
      )

      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Intenta nuevamente.')
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
              <Link to="/cambiar-contrasena" className="login-form-modern__forgot">
                ¿Olvidaste tu contraseña?
              </Link>
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
