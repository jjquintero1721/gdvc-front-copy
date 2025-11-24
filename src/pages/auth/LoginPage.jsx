import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import authService from '@/services/authService'

// Componentes UI
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Alert from '@/components/ui/Alert'

// Iconos
import AtSignIcon from '@/assets/icons/AtSignIcon'
import LockIcon from '@/assets/icons/LockIcon'
import AccountCircleIcon from '@/assets/icons/AccountCircleIcon'

import './LoginPage.css'

/**
 * Página de Login
 * RF-03 | Login
 * Basada en el diseño de Figma
 */
function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  // Manejador de cambios en los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  // Validación del formulario
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

  // Manejador del submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validar formulario
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      // Llamar al servicio de autenticación
      const response = await authService.login(formData.email, formData.password)

      // Guardar usuario y tokens en el store
      login(
        response.user,
        {
          access_token: response.access_token,
          refresh_token: response.refresh_token
        },
        formData.rememberMe
      )

      // Redirigir al dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Card
        title="Bienvenido de vuelta"
        subtitle="Accede a tu cuenta de clínica veterinaria"
        headerIcon={<AccountCircleIcon />}
      >
        <form onSubmit={handleSubmit} className="login-form">
          {/* Mensaje de error general */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {/* Campo de Email */}
          <Input
            label="Correo Electrónico"
            type="email"
            name="email"
            id="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
            icon={<AtSignIcon />}
            required
            autoComplete="email"
          />

          {/* Campo de Contraseña */}
          <Input
            label="Contraseña"
            type="password"
            name="password"
            id="password"
            placeholder="********"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            icon={<LockIcon />}
            required
            autoComplete="current-password"
          />

          {/* Recordarme y Olvidaste tu contraseña */}
          <div className="login-form__options">
            <Checkbox
              label="Recordarme"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <Link to="/cambiar-contrasena" className="login-form__forgot caption">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Botón de Login */}
          <Button
            type="submit"
            variant="primary"
            size="medium"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Iniciar Sesión
          </Button>

          {/* Link a Registro */}
          <div className="login-form__register caption">
            ¿No tienes cuenta?{' '}
            <Link to="/registro">Créala aquí</Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage