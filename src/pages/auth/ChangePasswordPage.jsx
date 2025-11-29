import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/AuthStore.jsx'
import authService from '@/services/authService'

// Componentes UI
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'

// Iconos
import LockIcon from '@/assets/icons/LockIcon'
import AccountCircleIcon from '@/assets/icons/AccountCircleIcon'

import './ChangePasswordPage.css'

/**
 * Página de Cambio de Contraseña
 * Permite al usuario cambiar su contraseña proporcionando la actual y la nueva
 * Nota: Según especificaciones, no se envía email, solo se requiere contraseña anterior
 */
function ChangePasswordPage() {
  const navigate = useNavigate()

  //  Obtener usuario autenticado y su ID del store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const currentUser = useAuthStore((state) => state.user)

  // Estado del formulario
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Manejador de cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  // Validación del formulario
  const validateForm = () => {
    const errors = {}

    if (!formData.oldPassword) {
      errors.oldPassword = 'La contraseña actual es requerida'
    }

    if (!formData.newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida'
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'La contraseña debe tener al menos 8 caracteres'
    } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.newPassword)) {
      errors.newPassword = 'La contraseña debe incluir números y símbolos'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Debes confirmar la nueva contraseña'
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
      errors.newPassword = 'La nueva contraseña debe ser diferente a la actual'
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

    // Validar que el usuario esté autenticado y tenga ID
    if (!currentUser || !currentUser.id) {
      setError('No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.')
      return
    }

    setLoading(true)

    try {
      //  Llamar al servicio con userId, oldPassword, newPassword
      await authService.changePassword(
        currentUser.id,           //  userId del usuario autenticado
        formData.oldPassword,     //  Contraseña actual
        formData.newPassword      //  Nueva contraseña
      )

      // Mostrar mensaje de éxito
      setSuccess(true)

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        // Limpiar sesión ya que cambió la contraseña
        localStorage.clear()

        navigate('/login', {
          state: {
            message: 'Contraseña cambiada exitosamente. Por favor inicia sesión nuevamente con tu nueva contraseña.'
          }
        })
      }, 2000)
    } catch (err) {
      console.error('Error al cambiar contraseña:', err)
      setError(err.message || 'Error al cambiar la contraseña. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  // Si el cambio fue exitoso, mostrar mensaje
  if (success) {
    return (
      <div className="change-password-page">
        <Card
          title="¡Contraseña actualizada!"
          subtitle="Tu contraseña ha sido cambiada exitosamente"
          headerIcon={<AccountCircleIcon />}
        >
          <div className="change-password-success">
            <Alert
              type="success"
              title="Cambio exitoso"
              message="Serás redirigido a la página de inicio de sesión..."
            />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="change-password-page">
      <Card
        title={isAuthenticated ? "Cambiar Contraseña" : "Actualiza tu contraseña"}
        subtitle={isAuthenticated ? "Actualiza tu contraseña regularmente para mantener tu cuenta segura" : "Para cambiar tu contraseña necesitas estar autenticado"}
        headerIcon={<AccountCircleIcon />}
      >
        {!isAuthenticated ? (
          <div className="change-password-unauthenticated">
            <Alert
              type="warning"
              title="Sesión requerida"
              message="Debes iniciar sesión para cambiar tu contraseña"
            />
            <Button
              variant="primary"
              size="medium"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Ir a Iniciar Sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="change-password-form">
            {/* Mensaje de error general */}
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            )}

            {/* Información del usuario actual */}
            <div className="user-info-alert">
              <Alert
                type="info"
                title="Información"
                message={`Cambiando contraseña para: ${currentUser?.nombre || currentUser?.correo || 'Usuario'}`}
              />
            </div>

            {/* Contraseña Actual */}
            <Input
              label="Contraseña Actual"
              type="password"
              name="oldPassword"
              id="oldPassword"
              placeholder="Ingresa tu contraseña actual"
              value={formData.oldPassword}
              onChange={handleChange}
              error={fieldErrors.oldPassword}
              icon={<LockIcon />}
              required
              autoComplete="current-password"
            />

            {/* Nueva Contraseña */}
            <Input
              label="Nueva Contraseña"
              type="password"
              name="newPassword"
              id="newPassword"
              placeholder="Ingresa tu nueva contraseña"
              value={formData.newPassword}
              onChange={handleChange}
              error={fieldErrors.newPassword}
              helperText="Mínimo 8 caracteres, incluye números y símbolos"
              icon={<LockIcon />}
              required
              autoComplete="new-password"
            />

            {/* Requisitos de la contraseña */}
            <div className="password-requirements">
              <p className="caption">Requisitos de la contraseña:</p>
              <ul className="caption">
                <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                  Mínimo 8 caracteres
                </li>
                <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                  Al menos una letra mayúscula
                </li>
                <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                  Al menos una letra minúscula
                </li>
                <li className={/[0-9]/.test(formData.newPassword) ? 'valid' : ''}>
                  Al menos un número
                </li>
              </ul>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <Input
              label="Confirmar Nueva Contraseña"
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirma tu nueva contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
              icon={<LockIcon />}
              required
              autoComplete="new-password"
            />

            {/* Botón de Cambiar Contraseña */}
            <Button
              type="submit"
              variant="primary"
              size="medium"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>

            {/* Link de regreso */}
            <div className="change-password-form__back caption">
              <Link to="/dashboard">← Volver al Dashboard</Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}

export default ChangePasswordPage