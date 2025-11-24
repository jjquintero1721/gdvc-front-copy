import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '@/services/authService'

// Componentes UI
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Alert from '@/components/ui/Alert'

// Iconos
import UserIcon from '@/assets/icons/UserIcon'
import AtSignIcon from '@/assets/icons/AtSignIcon'
import LockIcon from '@/assets/icons/LockIcon'
import CreditCardIcon from '@/assets/icons/CreditCardIcon'
import PhoneIcon from '@/assets/icons/PhoneIcon'
import MapPinIcon from '@/assets/icons/MapPinIcon'
import AccountCircleIcon from '@/assets/icons/AccountCircleIcon'

import './RegisterPage.css'

/**
 * Página de Registro
 * RF-01 | Registro
 * Basada en el diseño de Figma
 */
function RegisterPage() {
  const navigate = useNavigate()

  // Estado del formulario
  const [formData, setFormData] = useState({
    full_name: '',
    cedula: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    acceptTerms: false
  })

  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
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

    if (!formData.full_name.trim()) {
      errors.full_name = 'El nombre completo es requerido'
    } else if (formData.full_name.trim().length < 3) {
      errors.full_name = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.cedula.trim()) {
      errors.cedula = 'La cédula es requerida'
    } else if (!/^\d{8,12}$/.test(formData.cedula.trim())) {
      errors.cedula = 'Ingresa una cédula válida (8-12 dígitos)'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'El teléfono es requerido'
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = 'Ingresa un teléfono válido (10 dígitos)'
    }

    if (!formData.address.trim()) {
      errors.address = 'La dirección es requerida'
    }

    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Ingresa un correo electrónico válido'
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres'
    } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.password)) {
      errors.password = 'La contraseña debe incluir números y símbolos'
    }

    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Debes aceptar los términos y condiciones'
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
      // Preparar datos para el backend
      const userData = {
        nombre: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        cedula: formData.cedula,
        rol: 'propietario'
      }

      // Llamar al servicio de autenticación
      await authService.register(userData)

      // Mostrar mensaje de éxito
      setSuccess(true)

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Registro exitoso. Por favor inicia sesión.'
          }
        })
      }, 2000)
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  // Si el registro fue exitoso, mostrar mensaje
  if (success) {
    return (
      <div className="register-page">
        <Card
          title="¡Cuenta creada!"
          subtitle="Tu cuenta ha sido creada exitosamente"
          headerIcon={<AccountCircleIcon />}
        >
          <div className="register-success">
            <Alert
              type="success"
              title="Registro exitoso"
              message="Serás redirigido a la página de inicio de sesión..."
            />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="register-page">
      <Card
        title="Crea tu cuenta"
        subtitle="Únete a la familia de Clínica Veterinaria"
        headerIcon={<AccountCircleIcon />}
      >
        <form onSubmit={handleSubmit} className="register-form">
          {/* Mensaje de error general */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {/* Nombre Completo */}
          <Input
            label="Nombre Completo"
            type="text"
            name="full_name"
            id="full_name"
            placeholder="Juan Perez"
            value={formData.full_name}
            onChange={handleChange}
            error={fieldErrors.full_name}
            icon={<UserIcon />}
            required
            autoComplete="name"
          />

          {/* Fila: Cédula y Teléfono */}
          <div className="register-form__row">
            <Input
              label="Cédula"
              type="text"
              name="cedula"
              id="cedula"
              placeholder="1234567890"
              value={formData.cedula}
              onChange={handleChange}
              error={fieldErrors.cedula}
              icon={<CreditCardIcon />}
              required
            />

            <Input
              label="Teléfono"
              type="tel"
              name="phone"
              id="phone"
              placeholder="3001234567"
              value={formData.phone}
              onChange={handleChange}
              error={fieldErrors.phone}
              icon={<PhoneIcon />}
              required
              autoComplete="tel"
            />
          </div>

          {/* Dirección */}
          <Input
            label="Dirección"
            type="text"
            name="address"
            id="address"
            placeholder="Calle 123 #45-67"
            value={formData.address}
            onChange={handleChange}
            error={fieldErrors.address}
            icon={<MapPinIcon />}
            required
            autoComplete="street-address"
          />

          {/* Email */}
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

          {/* Contraseña */}
          <Input
            label="Contraseña"
            type="password"
            name="password"
            id="password"
            placeholder="********"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            helperText="Mínimo 8 caracteres, incluye números y símbolos para mayor seguridad"
            icon={<LockIcon />}
            required
            autoComplete="new-password"
          />

          {/* Términos y Condiciones */}
          <div className="register-form__terms">
            <Checkbox
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
            />
            <div className="register-form__terms-text">
              <p className="body-m">Acepto los términos y condiciones</p>
              <p className="caption" style={{ color: 'var(--gray-400)' }}>
                Al registrarte, aceptas nuestra política de privacidad y términos de servicio
              </p>
            </div>
          </div>
          {fieldErrors.acceptTerms && (
            <p className="input-error caption" role="alert">
              {fieldErrors.acceptTerms}
            </p>
          )}

          {/* Botón de Registro */}
          <Button
            type="submit"
            variant="primary"
            size="medium"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Crear cuenta
          </Button>

          {/* Link a Login */}
          <div className="register-form__login caption">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login">Inicia sesión</Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default RegisterPage